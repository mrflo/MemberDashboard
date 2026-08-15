import { css, customElement, html, nothing, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import { UMB_NOTIFICATION_CONTEXT } from "@umbraco-cms/backoffice/notification";
import {
  UMB_EDIT_MEMBER_WORKSPACE_PATH_PATTERN,
  UmbMemberDetailRepository,
} from "@umbraco-cms/backoffice/member";
import type { UmbMemberDetailModel } from "@umbraco-cms/backoffice/member";
import "@umbraco-cms/backoffice/member-group";
import type { UmbMemberEditModalData, UmbMemberEditModalValue } from "./member-edit-modal.token.js";

/**
 * The side panel for editing one member.
 *
 * Scope is deliberately the management-relevant fields — identity, status, groups, password. Member
 * type properties live in the built-in workspace, which the footer links to, because reproducing a
 * doctype-driven property editor here would duplicate a large part of the backoffice.
 */
@customElement("member-dashboard-edit-modal")
export class UmbMemberDashboardEditModalElement extends UmbModalBaseElement<
  UmbMemberEditModalData,
  UmbMemberEditModalValue
> {
  #repository = new UmbMemberDetailRepository(this);

  @state()
  private _member?: UmbMemberDetailModel;

  @state()
  private _loading = true;

  @state()
  private _saving = false;

  @state()
  private _loadFailed = false;

  @state()
  private _newPassword = "";

  override connectedCallback() {
    super.connectedCallback();
    this.#load();
  }

  async #load() {
    const unique = this.data?.unique;
    if (!unique) {
      this._loading = false;
      this._loadFailed = true;
      return;
    }

    const { data } = await this.#repository.requestByUnique(unique);
    this._member = data;
    this._loadFailed = !data;
    this._loading = false;
  }

  get #memberName(): string {
    return this._member?.variants?.[0]?.name ?? this._member?.username ?? "";
  }

  /**
   * Members are invariant, so name lives on the single variant rather than on the model root.
   */
  #patchName(name: string) {
    if (!this._member) return;
    this._member = {
      ...this._member,
      variants: this._member.variants.map((variant, index) =>
        index === 0 ? { ...variant, name } : variant,
      ),
    };
  }

  #patch(partial: Partial<UmbMemberDetailModel>) {
    if (!this._member) return;
    this._member = { ...this._member, ...partial };
  }

  #onInput(event: Event, key: "email" | "username") {
    this.#patch({ [key]: (event.target as HTMLInputElement).value } as Partial<UmbMemberDetailModel>);
  }

  #onToggle(event: Event, key: "isApproved" | "isLockedOut" | "isTwoFactorEnabled") {
    const checked = (event.target as HTMLInputElement).checked;
    this.#patch({ [key]: checked } as Partial<UmbMemberDetailModel>);
  }

  #onGroupsChange(event: Event) {
    // `umb-input-member-group` works in group keys, which is also what the member model stores.
    const selection = (event.target as unknown as { selection: Array<string> }).selection;
    this.#patch({ groups: selection });
  }

  async #onSave() {
    if (!this._member) return;

    this._saving = true;

    const { error } = await this.#repository.save({
      ...this._member,
      // Only send a password when one was typed; an empty string would be treated as a change.
      newPassword: this._newPassword.trim() || undefined,
    });

    this._saving = false;

    const notificationContext = await this.getContext(UMB_NOTIFICATION_CONTEXT);

    if (error) {
      // The repository already reports the failure detail; this just keeps the panel open so the
      // user does not lose their edits.
      return;
    }

    notificationContext?.peek("positive", {
      data: {
        headline: this.localize.term("memberDashboard_editSaved"),
        message: this.#memberName,
      },
    });

    this.value = { saved: true };
    this.modalContext?.submit();
  }

  #onCancel() {
    this.modalContext?.reject();
  }

  #renderDetail(labelKey: string, value: string | null) {
    return html`
      <div class="detail">
        <span class="detail-label">${this.localize.term(labelKey)}</span>
        <span>
          ${value
            ? html`<umb-localize-date .date=${value}></umb-localize-date>`
            : this.localize.term("memberDashboard_editNever")}
        </span>
      </div>
    `;
  }

  override render() {
    return html`
      <umb-body-layout headline=${this.#memberName || this.localize.term("memberDashboard_editHeadline")}>
        ${this.#renderContent()}
        <div slot="actions">${this.#renderActions()}</div>
      </umb-body-layout>
    `;
  }

  #renderContent() {
    if (this._loading) {
      return html`<uui-loader></uui-loader>`;
    }

    if (this._loadFailed || !this._member) {
      return html`<umb-localize key="memberDashboard_editLoadFailed"></umb-localize>`;
    }

    return html`
      <uui-box>
        <uui-form-layout-item>
          <uui-label slot="label" for="name">${this.localize.term("general_name")}</uui-label>
          <uui-input
            id="name"
            .value=${this.#memberName}
            @input=${(event: Event) => this.#patchName((event.target as HTMLInputElement).value)}
          ></uui-input>
        </uui-form-layout-item>

        <uui-form-layout-item>
          <uui-label slot="label" for="email">${this.localize.term("general_email")}</uui-label>
          <uui-input
            id="email"
            type="email"
            .value=${this._member.email}
            @input=${(event: Event) => this.#onInput(event, "email")}
          ></uui-input>
        </uui-form-layout-item>

        <uui-form-layout-item>
          <uui-label slot="label" for="username">${this.localize.term("general_username")}</uui-label>
          <uui-input
            id="username"
            .value=${this._member.username}
            @input=${(event: Event) => this.#onInput(event, "username")}
          ></uui-input>
        </uui-form-layout-item>

        <uui-form-layout-item>
          <uui-label slot="label" for="newPassword">
            ${this.localize.term("memberDashboard_editNewPassword")}
          </uui-label>
          <span slot="description">
            ${this.localize.term("memberDashboard_editNewPasswordDescription")}
          </span>
          <uui-input
            id="newPassword"
            type="password"
            autocomplete="new-password"
            .value=${this._newPassword}
            @input=${(event: Event) => {
              this._newPassword = (event.target as HTMLInputElement).value;
            }}
          ></uui-input>
        </uui-form-layout-item>

        <uui-form-layout-item>
          <uui-label slot="label">${this.localize.term("memberDashboard_editGroups")}</uui-label>
          <umb-input-member-group
            .selection=${this._member.groups}
            @change=${this.#onGroupsChange}
          ></umb-input-member-group>
        </uui-form-layout-item>

        <uui-form-layout-item>
          <uui-toggle
            label=${this.localize.term("memberDashboard_editApproved")}
            ?checked=${this._member.isApproved}
            @change=${(event: Event) => this.#onToggle(event, "isApproved")}
          ></uui-toggle>
          <uui-toggle
            label=${this.localize.term("memberDashboard_editLockedOut")}
            ?checked=${this._member.isLockedOut}
            @change=${(event: Event) => this.#onToggle(event, "isLockedOut")}
          ></uui-toggle>
          <uui-toggle
            label=${this.localize.term("memberDashboard_editTwoFactor")}
            ?checked=${this._member.isTwoFactorEnabled}
            @change=${(event: Event) => this.#onToggle(event, "isTwoFactorEnabled")}
          ></uui-toggle>
        </uui-form-layout-item>

        <div id="details">
          <div class="detail">
            <span class="detail-label">
              ${this.localize.term("memberDashboard_editFailedAttempts")}
            </span>
            <span>${this._member.failedPasswordAttempts}</span>
          </div>
          ${this.#renderDetail("memberDashboard_editLastLogin", this._member.lastLoginDate)}
          ${this.#renderDetail("memberDashboard_editLastLockout", this._member.lastLockoutDate)}
        </div>
      </uui-box>
    `;
  }

  #renderActions() {
    const unique = this.data?.unique;

    return html`
      ${unique && !this._loadFailed
        ? html`<uui-button
            look="secondary"
            href=${UMB_EDIT_MEMBER_WORKSPACE_PATH_PATTERN.generateAbsolute({ unique })}
            label=${this.localize.term("memberDashboard_editOpenFullEditor")}
          ></uui-button>`
        : nothing}
      <uui-button
          label=${this.localize.term("general_cancel")}
        @click=${this.#onCancel}
      ></uui-button>
      <uui-button
        look="primary"
        color="positive"
        label=${this.localize.term("buttons_save")}
        ?disabled=${this._loading || this._loadFailed || this._saving}
        .state=${this._saving ? "waiting" : undefined}
        @click=${this.#onSave}
      ></uui-button>
    `;
  }

  static override styles = [
    UmbTextStyles,
    css`
      uui-input,
      umb-input-member-group {
        width: 100%;
      }

      uui-toggle {
        display: block;
      }

      #details {
        margin-top: var(--uui-size-space-5);
        padding-top: var(--uui-size-space-4);
        border-top: 1px solid var(--uui-color-divider);
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-space-2);
      }

      .detail {
        display: flex;
        justify-content: space-between;
        gap: var(--uui-size-space-4);
      }

      .detail-label {
        color: var(--uui-color-text-alt);
      }
    `,
  ];
}

export default UmbMemberDashboardEditModalElement;

declare global {
  interface HTMLElementTagNameMap {
    "member-dashboard-edit-modal": UmbMemberDashboardEditModalElement;
  }
}
