import { UmbEntityBulkActionBase } from "@umbraco-cms/backoffice/entity-bulk-action";
import type { MetaEntityBulkAction } from "@umbraco-cms/backoffice/extension-registry";
import { UmbLocalizationController } from "@umbraco-cms/backoffice/localization-api";
import { UMB_NOTIFICATION_CONTEXT } from "@umbraco-cms/backoffice/notification";
import { umbConfirmModal } from "@umbraco-cms/backoffice/modal";
import { UMB_COLLECTION_CONTEXT } from "@umbraco-cms/backoffice/collection";
import { tryExecute } from "@umbraco-cms/backoffice/resources";
import { postBulk } from "../api/index.js";
import type { MemberBulkActionType } from "../api/index.js";

export interface UmbMemberBulkActionConfirmation {
  headline: string;
  message: string;
  confirmLabel: string;
  color: "danger" | "warning";
}

/**
 * Shared behaviour for the dashboard's bulk actions.
 *
 * Every action is a single request to this package's `/bulk` endpoint rather than one request per
 * member: it keeps a 200-member unlock to one round trip, and lets the server do the work
 * atomically per member and report exactly which ones failed.
 */
export abstract class UmbMemberBulkActionBase extends UmbEntityBulkActionBase<MetaEntityBulkAction> {
  /**
   * Actions are controllers, not elements, so they do not inherit `this.localize` from
   * `UmbLitElement` — the localization controller has to be attached explicitly.
   */
  protected readonly localize = new UmbLocalizationController(this);

  /** The operation to send to the server. */
  protected abstract action: MemberBulkActionType;

  /**
   * Return a confirmation prompt for destructive actions, or `undefined` to run immediately.
   * Unlocking and approving are trivially reversible, so they do not interrupt the user.
   */
  protected confirmation(): UmbMemberBulkActionConfirmation | undefined {
    return undefined;
  }

  override async execute() {
    if (!this.selection.length) return;

    const confirmation = this.confirmation();
    if (confirmation) {
      // Rejects when the user backs out — that is a cancel, not a failure.
      const confirmed = await umbConfirmModal(this, {
        headline: confirmation.headline,
        content: confirmation.message,
        confirmLabel: confirmation.confirmLabel,
        color: confirmation.color,
      })
        .then(() => true)
        .catch(() => false);

      if (!confirmed) return;
    }

    const { data, error } = await tryExecute(
      this,
      postBulk({
        body: {
          memberIds: this.selection,
          action: this.action,
        },
      }),
    );

    // tryExecute has already surfaced the transport/HTTP error to the user.
    if (error || !data) return;

    await this.#report(data.succeeded, data.failed.length);
    await this.#refreshCollection();
  }

  async #report(succeeded: number, failed: number) {
    const notificationContext = await this.getContext(UMB_NOTIFICATION_CONTEXT);
    if (!notificationContext) return;

    if (failed === 0) {
      notificationContext.peek("positive", {
        data: {
          headline: this.localize.term("memberDashboard_bulkSuccessHeadline"),
          message: this.localize.term("memberDashboard_bulkSuccessMessage", succeeded),
        },
      });
      return;
    }

    if (succeeded === 0) {
      notificationContext.peek("danger", {
        data: {
          headline: this.localize.term("memberDashboard_bulkFailureHeadline"),
          message: this.localize.term("memberDashboard_bulkFailureMessage"),
        },
      });
      return;
    }

    // Partial success is a real outcome of a per-member operation, so it gets its own message
    // rather than being rounded up to "done" or down to "failed".
    notificationContext.peek("warning", {
      data: {
        headline: this.localize.term("memberDashboard_bulkPartialHeadline"),
        message: this.localize.term("memberDashboard_bulkPartialMessage", succeeded, failed),
      },
    });
  }

  async #refreshCollection() {
    const collectionContext = await this.getContext(UMB_COLLECTION_CONTEXT);
    if (!collectionContext) return;

    // Deleted members are gone and updated ones have new status; clear the stale selection so the
    // action bar does not keep offering actions for rows that may no longer exist.
    collectionContext.selection.setSelection([]);
    collectionContext.loadCollection();
  }
}
