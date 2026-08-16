import { css, customElement, html, nothing, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UMB_COLLECTION_CONTEXT } from "@umbraco-cms/backoffice/collection";
import { UmbMemberGroupCollectionRepository } from "@umbraco-cms/backoffice/member-group";
import { debounce } from "@umbraco-cms/backoffice/utils";
import type { UmbMemberDashboardCollectionContext } from "./member-dashboard-collection.context.js";
import type { UmbMemberDashboardCollectionFilterModel } from "./types.js";

type TriState = "" | "true" | "false";

/**
 * Additional filters for the member dashboard.
 *
 * The free-text field replaces Umbraco's `umb-collection-filter-field` rather than reusing it. That
 * component exposes no slot, so there is nowhere to hang a clear button, and it holds its own
 * uncontrolled value — which meant "Clear filters" reset the query on the server while leaving the
 * typed text sitting in the box. This renders the same `uui-input` with the same 500ms debounce,
 * and follows the clear-button pattern Umbraco uses in its own search fields.
 */
@customElement("member-dashboard-filters")
export class UmbMemberDashboardFiltersElement extends UmbLitElement {
  #collectionContext?: UmbMemberDashboardCollectionContext;
  #memberGroupRepository = new UmbMemberGroupCollectionRepository(this);

  @state()
  private _groupNames: Array<string> = [];

  @state()
  private _query = "";

  @state()
  private _selectedGroup = "";

  @state()
  private _approved: TriState = "";

  @state()
  private _lockedOut: TriState = "";

  constructor() {
    super();

    this.consumeContext(UMB_COLLECTION_CONTEXT, (context) => {
      this.#collectionContext = context as unknown as UmbMemberDashboardCollectionContext;

      this.observe(
        this.#collectionContext.filter,
        (filter) => {
          const current = filter as UmbMemberDashboardCollectionFilterModel;

          // Keeps the box in step with the context, so resetFilter() empties it too.
          this._query = current.filter ?? "";
          this._selectedGroup = current.memberGroupName ?? "";
          this._approved = toTriState(current.isApproved);
          this._lockedOut = toTriState(current.isLockedOut);
        },
        "_memberDashboardFilterObserver",
      );
    });
  }

  override connectedCallback() {
    super.connectedCallback();
    this.#loadMemberGroups();
  }

  async #loadMemberGroups() {
    const { data } = await this.#memberGroupRepository.requestCollection({
      skip: 0,
      take: 500,
    });

    this._groupNames = (data?.items ?? [])
      .map((item) => item.name)
      .filter((name): name is string => !!name)
      .sort((a, b) => a.localeCompare(b));
  }

  get #hasActiveFilter(): boolean {
    return (
      !!this._query ||
      !!this._selectedGroup ||
      this._approved !== "" ||
      this._lockedOut !== ""
    );
  }

  // Same 500ms as Umbraco's own collection filter field, so typing does not fire a request per
  // keystroke. Unlike that component this goes through applyFilter, which also returns to page 1 —
  // narrowing the query while on page 5 would otherwise strand you past the end of the results.
  #debouncedFilter = debounce((query: string) => {
    this.#collectionContext?.applyFilter({ filter: query || undefined });
  }, 500);

  #onQueryInput(event: Event) {
    this._query = (event.target as HTMLInputElement).value ?? "";
    this.#debouncedFilter(this._query);
  }

  #onClearQuery() {
    this._query = "";
    this.#collectionContext?.applyFilter({ filter: undefined });
  }

  #onGroupChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;

    this.#collectionContext?.applyFilter({
      memberGroupName: value || undefined,
    });
  }

  #onApprovedChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as TriState;

    this.#collectionContext?.applyFilter({
      isApproved: fromTriState(value),
    });
  }

  #onLockedOutChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as TriState;

    this.#collectionContext?.applyFilter({
      isLockedOut: fromTriState(value),
    });
  }

  #onClear() {
    this.#collectionContext?.resetFilter();
  }

  override render() {
    return html`
      <div id="filters">

        <uui-input
          id="query"
          label=${this.localize.term("memberDashboard_filterQueryLabel")}
          placeholder=${this.localize.term("placeholders_filter")}
          .value=${this._query}
          @input=${this.#onQueryInput}
        >
          ${this._query
            ? html`
              <uui-button
                compact
                slot="append"
                type="button"
                label=${this.localize.term("general_clear")}
                @click=${this.#onClearQuery}
              >
                <uui-icon name="icon-delete" aria-hidden="true"></uui-icon>
              </uui-button>
            `
            : nothing}
        </uui-input>

        <uui-select
          label=${this.localize.term("memberDashboard_filterGroupLabel")}
          .value=${this._selectedGroup}
          .options=${[
            {
              name: this.localize.term("memberDashboard_filterAllGroups"),
              value: "",
              selected: this._selectedGroup === "",
            },
            ...this._groupNames.map((name) => ({
              name,
              value: name,
              selected: name === this._selectedGroup,
            })),
          ]}
          @change=${this.#onGroupChange}
        ></uui-select>

        <uui-select
          label=${this.localize.term("memberDashboard_filterApprovedLabel")}
          .value=${this._approved}
          .options=${[
            {
              name: this.localize.term("memberDashboard_filterAnyStatus"),
              value: "",
              selected: this._approved === "",
            },
            {
              name: this.localize.term("memberDashboard_approved"),
              value: "true",
              selected: this._approved === "true",
            },
            {
              name: this.localize.term("memberDashboard_notApproved"),
              value: "false",
              selected: this._approved === "false",
            },
          ]}
          @change=${this.#onApprovedChange}
        ></uui-select>

        <uui-select
          label=${this.localize.term("memberDashboard_filterLockedOutLabel")}
          .value=${this._lockedOut}
          .options=${[
            {
              name: this.localize.term("memberDashboard_filterAnyLockout"),
              value: "",
              selected: this._lockedOut === "",
            },
            {
              name: this.localize.term("memberDashboard_lockedOut"),
              value: "true",
              selected: this._lockedOut === "true",
            },
            {
              name: this.localize.term("memberDashboard_notLockedOut"),
              value: "false",
              selected: this._lockedOut === "false",
            },
          ]}
          @change=${this.#onLockedOutChange}
        ></uui-select>

        ${this.#hasActiveFilter
          ? html`
            <uui-button
              compact
              look="secondary"
              label=${this.localize.term("memberDashboard_clearFilters")}
              @click=${this.#onClear}
            ></uui-button>
          `
          : nothing}
      </div>
    `;
  }

  static override styles = [
    css`
      #filters {
        display: flex;
        align-items: center;
        gap: var(--uui-size-space-3);
        flex-wrap: wrap;
      }

      #query {
        flex: 1 1 250px;
        min-width: 250px;
      }

      uui-select {
        min-width: 150px;
      }
    `,
  ];
}

/** `undefined` means "don't filter on this at all". */
function toTriState(value: boolean | undefined): TriState {
  if (value === true) return "true";
  if (value === false) return "false";
  return "";
}

function fromTriState(value: TriState): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export default UmbMemberDashboardFiltersElement;

declare global {
  interface HTMLElementTagNameMap {
    "member-dashboard-filters": UmbMemberDashboardFiltersElement;
  }
}
