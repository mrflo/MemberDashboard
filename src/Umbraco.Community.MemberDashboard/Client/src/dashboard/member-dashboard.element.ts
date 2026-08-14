import { css, customElement, html } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { MEMBER_DASHBOARD_COLLECTION_ALIAS } from "../constants.js";

/**
 * The dashboard is a thin host: all of the behaviour lives in the collection, which lets the
 * backoffice supply the standard toolbar, pagination, selection bar and view switching.
 */
@customElement("member-dashboard")
export class UmbMemberDashboardElement extends UmbLitElement {
  override render() {
    return html`<umb-collection alias=${MEMBER_DASHBOARD_COLLECTION_ALIAS}></umb-collection>`;
  }

  static override styles = [
    css`
      :host {
        display: block;
        height: 100%;
      }
    `,
  ];
}

export default UmbMemberDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "member-dashboard": UmbMemberDashboardElement;
  }
}
