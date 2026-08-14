import { manifests as bulkActions } from "./bulk-actions/manifests.js";
import { manifests as collection } from "./collection/manifests.js";
import { manifests as dashboard } from "./dashboard/manifests.js";
import { manifests as edit } from "./edit/manifests.js";
import { manifests as entrypoints } from "./entrypoints/manifest.js";
import { manifests as localization } from "./localization/manifests.js";

/**
 * The bundle collates every manifest in the package. `umbraco-package.json` loads this one file,
 * and everything else is registered from here.
 */
export const manifests: Array<UmbExtensionManifest> = [
  ...entrypoints,
  ...localization,
  ...dashboard,
  ...collection,
  ...bulkActions,
  ...edit,
];
