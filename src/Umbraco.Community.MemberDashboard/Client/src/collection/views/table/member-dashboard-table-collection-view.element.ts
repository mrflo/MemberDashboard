import { css, customElement, html, nothing, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import { UMB_COLLECTION_CONTEXT } from "@umbraco-cms/backoffice/collection";
import type {
  UmbTableColumn,
  UmbTableConfig,
  UmbTableElement,
  UmbTableItem,
} from "@umbraco-cms/backoffice/components";
import { umbOpenModal } from "@umbraco-cms/backoffice/modal";
import { UmbMemberGroupItemRepository } from "@umbraco-cms/backoffice/member-group";
import { MEMBER_EDIT_MODAL } from "../../../edit/member-edit-modal.token.js";
import type { UmbMemberDashboardCollectionContext } from "../../member-dashboard-collection.context.js";
import type { UmbMemberDashboardCollectionItemModel } from "../../types.js";

/**
 * Which server-side `orderBy` value each sortable column maps to. Columns absent from this map
 * render without a sort control, because `filter/member` cannot order by them.
 */
const COLUMN_TO_ORDER_BY: Record<string, string> = {
  memberName: "name",
  memberUsername: "username",
  memberEmail: "email",
  memberLastLogin: "lastLoginDate",
  memberCreateDate: "createDate",
};

@customElement("member-dashboard-table-collection-view")
export class UmbMemberDashboardTableCollectionViewElement extends UmbLitElement {
  #collectionContext?: UmbMemberDashboardCollectionContext;
  #memberGroupItemRepository = new UmbMemberGroupItemRepository(this);

  /**
   * A member's `groups` are group keys, not names, so they have to be resolved before they can be
   * shown. Cached across pages because the same handful of groups recurs on every row.
   */
  #groupNamesByUnique = new Map<string, string>();

  @state()
  private _tableItems: Array<UmbTableItem> = [];

  @state()
  private _selection: Array<string> = [];

  @state()
  private _orderingColumn = "memberCreateDate";

  @state()
  private _orderingDesc = true;

  private _tableConfig: UmbTableConfig = {
    allowSelection: true,
  };

  private _tableColumns: Array<UmbTableColumn> = [
    { name: this.localize.term("general_name"), alias: "memberName", allowSorting: true },
    { name: this.localize.term("general_username"), alias: "memberUsername", allowSorting: true },
    { name: this.localize.term("general_email"), alias: "memberEmail", allowSorting: true },
    { name: this.localize.term("memberDashboard_columnGroups"), alias: "memberGroups" },
    { name: this.localize.term("memberDashboard_columnStatus"), alias: "memberStatus" },
    {
      name: this.localize.term("memberDashboard_columnLastLogin"),
      alias: "memberLastLogin",
      allowSorting: true,
    },
    {
      name: this.localize.term("memberDashboard_columnCreated"),
      alias: "memberCreateDate",
      allowSorting: true,
    },
    { name: "", alias: "entityActions", align: "right" },
  ];

  constructor() {
    super();

    this.consumeContext(UMB_COLLECTION_CONTEXT, (context) => {
      this.#collectionContext = context as unknown as UmbMemberDashboardCollectionContext;

      // Wires up the collection's workspace/modal routing. Without it the collection's router slot
      // never resolves and row links into workspaces break.
      this.#collectionContext.setupView(this);

      this.observe(
        this.#collectionContext.items,
        (items) => this.#createTableItems(items),
        "_memberDashboardItemsObserver",
      );

      this.observe(
        this.#collectionContext.selection.selection,
        (selection) => {
          this._selection = (selection ?? []) as Array<string>;
        },
        "_memberDashboardSelectionObserver",
      );
    });
  }

  async #createTableItems(members: Array<UmbMemberDashboardCollectionItemModel>) {
    await this.#resolveGroupNames(members);

    this._tableItems = members.map((member) => ({
      id: member.unique,
      icon: member.memberTypeIcon || "icon-user",
      entityType: member.entityType,
      data: [
        {
          columnAlias: "memberName",
          value: html`<button
            type="button"
            class="member-name"
            @click=${() => this.#openEditPanel(member)}
          >
            ${member.name}
          </button>`,
        },
        { columnAlias: "memberUsername", value: member.username },
        { columnAlias: "memberEmail", value: member.email },
        {
          columnAlias: "memberGroups",
          value: member.groups.length
            ? html`<div class="tags">
                ${member.groups.map(
                  (group) =>
                    html`<uui-tag look="secondary">
                      ${this.#groupNamesByUnique.get(group) ?? group}
                    </uui-tag>`,
                )}
              </div>`
            : nothing,
        },
        { columnAlias: "memberStatus", value: this.#renderStatus(member) },
        {
          columnAlias: "memberLastLogin",
          value: html`<umb-date-table-column-view
            .value=${member.lastLoginDate}
          ></umb-date-table-column-view>`,
        },
        {
          columnAlias: "memberCreateDate",
          value: html`<umb-date-table-column-view
            .value=${member.createDate}
          ></umb-date-table-column-view>`,
        },
        {
          columnAlias: "entityActions",
          value: html`<umb-entity-actions-table-column-view
            .value=${{
              entityType: member.entityType,
              unique: member.unique,
              name: member.name,
            }}
          ></umb-entity-actions-table-column-view>`,
        },
      ],
    }));
  }

  async #resolveGroupNames(members: Array<UmbMemberDashboardCollectionItemModel>) {
    const unknown = [
      ...new Set(
        members.flatMap((member) => member.groups).filter((unique) => !this.#groupNamesByUnique.has(unique)),
      ),
    ];

    if (!unknown.length) return;

    const { data } = await this.#memberGroupItemRepository.requestItems(unknown);
    data?.forEach((item) => this.#groupNamesByUnique.set(item.unique, item.name));
  }

  /**
   * A single status column reads far better across 50 rows than separate boolean checkmarks for
   * approved and locked-out, and it makes the states that need an editor's attention stand out.
   */
  #renderStatus(member: UmbMemberDashboardCollectionItemModel) {
    const tags = [];

    if (member.isLockedOut) {
      tags.push(
        html`<uui-tag color="danger" look="secondary">
          ${this.localize.term("memberDashboard_lockedOut")}
        </uui-tag>`,
      );
    }

    if (!member.isApproved) {
      tags.push(
        html`<uui-tag color="warning" look="secondary">
          ${this.localize.term("memberDashboard_notApproved")}
        </uui-tag>`,
      );
    }

    if (!tags.length) {
      tags.push(
        html`<uui-tag color="positive" look="secondary">
          ${this.localize.term("memberDashboard_active")}
        </uui-tag>`,
      );
    }

    return html`<div class="tags">${tags}</div>`;
  }

  async #openEditPanel(member: UmbMemberDashboardCollectionItemModel) {
    // Rejects when the panel is dismissed, which is a normal outcome rather than an error.
    const result = await umbOpenModal(this, MEMBER_EDIT_MODAL, {
      data: { unique: member.unique },
    }).catch(() => undefined);

    if (result?.saved) {
      this.#collectionContext?.loadCollection();
    }
  }

  #onOrdering(event: Event) {
    const table = event.target as UmbTableElement;
    const orderBy = table.orderingColumn ? COLUMN_TO_ORDER_BY[table.orderingColumn] : undefined;
    if (!orderBy) return;

    this._orderingColumn = table.orderingColumn;
    this._orderingDesc = table.orderingDesc;

    this.#collectionContext?.applyFilter({
      orderBy,
      orderDirection: table.orderingDesc ? "Descending" : "Ascending",
    });
  }

  #onSelectionChange(event: Event) {
    event.stopPropagation();
    const table = event.target as UmbTableElement;
    this.#collectionContext?.selection.setSelection(table.selection);
  }

  override render() {
    return html`
      <umb-table
        .config=${this._tableConfig}
        .columns=${this._tableColumns}
        .items=${this._tableItems}
        .selection=${this._selection}
        .orderingColumn=${this._orderingColumn}
        .orderingDesc=${this._orderingDesc}
        @ordered=${this.#onOrdering}
        @selected=${this.#onSelectionChange}
        @deselected=${this.#onSelectionChange}
      ></umb-table>
    `;
  }

  static override styles = [
    UmbTextStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--uui-size-space-1);
      }

      /* Looks like the name links in Umbraco's own collections, but opens the side panel. */
      .member-name {
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        color: var(--uui-color-interactive);
        cursor: pointer;
        text-align: left;
      }

      .member-name:hover {
        color: var(--uui-color-interactive-emphasis);
        text-decoration: underline;
      }
    `,
  ];
}

export default UmbMemberDashboardTableCollectionViewElement;

declare global {
  interface HTMLElementTagNameMap {
    "member-dashboard-table-collection-view": UmbMemberDashboardTableCollectionViewElement;
  }
}
