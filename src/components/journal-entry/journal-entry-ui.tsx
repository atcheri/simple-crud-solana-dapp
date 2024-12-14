"use client";

import { useState } from "react";
import {
  useJournalEntryProgram,
  useJournalEntryProgramAccount,
} from "./journal-entry-data-access";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { ExplorerLink } from "../cluster/cluster-ui";
import { ellipsify } from "../ui/ui-layout";

export function JournalEntryCreate() {
  const { createEntry } = useJournalEntryProgram();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const { publicKey } = useWallet();

  const isEntryValid = title.trim().length > 0 && message.trim().length > 0;

  const handleSubmit = () => {
    if (!publicKey || !isEntryValid) {
      return;
    }

    createEntry.mutateAsync({ title, message, owner: publicKey });
  };

  if (!publicKey) {
    return <p>Please connect your wallet</p>;
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      <textarea
        cols={30}
        rows={10}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="textarea textarea-bordered w-full max-w-xs"
      />
      <button
        disabled={!isEntryValid || createEntry.isPending}
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={handleSubmit}
      >
        Run program{createEntry.isPending && "..."}
      </button>
    </div>
  );
}

export function JournalList() {
  const { accounts, getProgramAccount } = useJournalEntryProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="flex justify-center alert alert-info">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={"space-y-6"}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.data?.map((account) => (
            <JournalEntryCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={"text-2xl"}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

export const JournalEntryCard = ({ account }: { account: PublicKey }) => {
  const { accountQuery, updateEntry, deleteEntry } =
    useJournalEntryProgramAccount({ account });
  const { publicKey } = useWallet();
  const [message, setMessage] = useState("");
  const title = accountQuery.data?.title ?? "";

  const isEntryValid = message.trim().length > 0;

  const handleSubmit = () => {
    if (!publicKey || !isEntryValid || !title) {
      return;
    }

    updateEntry.mutateAsync({ title, message, owner: publicKey });
  };

  if (!publicKey) {
    return <p>Please connect your wallet</p>;
  }

  if (accountQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2
            className="card-title justify-center text-3xl cursor-pointer"
            onClick={() => accountQuery.refetch()}
          >
            {accountQuery.data?.title}
          </h2>
          <p>{accountQuery.data?.message}</p>
          <div className="card-actions justify-around">
            <textarea
              placeholder="Update message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="textarea textarea-bordered w-full max-w-xs"
            />
            <button
              className="btn btn-xs lg:btn-md btn-primary"
              onClick={handleSubmit}
              disabled={updateEntry.isPending || !isEntryValid}
            >
              Update Journal Entry {updateEntry.isPending && "..."}
            </button>
          </div>
          <div className="text-center space-y-4">
            <p>
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
              />
            </p>
            <button
              className="btn btn-xs btn-secondary btn-outline"
              onClick={() => {
                if (
                  !window.confirm(
                    "Are you sure you want to close this account?"
                  )
                ) {
                  return;
                }
                const title = accountQuery.data?.title;
                if (title) {
                  return deleteEntry.mutateAsync(title);
                }
              }}
              disabled={deleteEntry.isPending}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
