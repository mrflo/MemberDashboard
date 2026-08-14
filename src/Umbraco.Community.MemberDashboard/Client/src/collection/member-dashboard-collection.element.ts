import { customElement, html } from "@umbraco-cms/backoffice/external/lit";
import { UmbCollectionDefaultElement } from "@umbraco-cms/backoffice/collection";
import "./member-dashboard-filters.element.js";

/**
 * The dashboard's collection shell.
 *
 * Extending `UmbCollectionDefaultElement` rather than building a layout from scratch means we
 * inherit Umbraco's standard collection chrome — toolbar, pagination, selection action bar, empty
 * and loading states — and only add the group/status filters. `umb-collection-toolbar` exposes a
 * default slot for exactly this.
 */
@customElement("member-dashboard-collection")
export class UmbMemberDashboardCollectionElement extends UmbCollectionDefaultElement {
  protected override renderToolbar() {
    return html`
      <umb-collection-toolbar slot="header">
        <member-dashboard-filters></member-dashboard-filters>
      </umb-collection-toolbar>
    `;
  }
}

export default UmbMemberDashboardCollectionElement;
export { UmbMemberDashboardCollectionElement as element };

declare global {
  interface HTMLElementTagNameMap {
    "member-dashboard-collection": UmbMemberDashboardCollectionElement;
  }
}
