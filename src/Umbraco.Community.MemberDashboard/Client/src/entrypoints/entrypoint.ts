import type {
  UmbEntryPointOnInit,
  UmbEntryPointOnUnload,
} from "@umbraco-cms/backoffice/extension-api";
import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import { client } from "../api/client.gen.js";

/**
 * Binds the generated API client to the backoffice auth context.
 *
 * `configureClient` sets the base URL and credentials, attaches the token callback with refresh,
 * and installs the standard response interceptors. Without it every call to the bulk endpoint
 * returns 401. The framework awaits `onInit`, so the client is ready before any element runs.
 */
export const onInit: UmbEntryPointOnInit = async (host, _extensionRegistry) => {
  const authContext = await host.getContext(UMB_AUTH_CONTEXT);
  if (!authContext) {
    console.warn(
      "[Member Dashboard] UMB_AUTH_CONTEXT unavailable — bulk actions will not be authenticated.",
    );
    return;
  }

  authContext.configureClient(client);
};

export const onUnload: UmbEntryPointOnUnload = () => {
  // Nothing to tear down: the client configuration is garbage collected with the extension.
};
