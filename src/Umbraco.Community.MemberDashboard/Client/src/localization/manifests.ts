export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "localization",
    alias: "MemberDashboard.Localization.EnUs",
    name: "English (US)",
    weight: 0,
    meta: {
      culture: "en-us",
    },
    js: () => import("./files/en-us.js"),
  },
  {
    // English is the fallback culture, so registering the same strings under plain `en` means
    // any English variant (en-gb, en-au, …) resolves rather than showing raw keys.
    type: "localization",
    alias: "MemberDashboard.Localization.En",
    name: "English",
    weight: 0,
    meta: {
      culture: "en",
    },
    js: () => import("./files/en-us.js"),
  },
];
