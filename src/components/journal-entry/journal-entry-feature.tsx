"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { ExplorerLink } from "../cluster/cluster-ui";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { JournalEntryCreate, JournalList } from "./journal-entry-ui";
import { useJournalEntryProgram } from "./journal-entry-data-access";

export default function JournalEntryFeature() {
  const { publicKey } = useWallet();
  const { programId } = useJournalEntryProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="Journal Entry"
        subtitle={'Run the program by clicking the "Run program" button.'}
      >
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <JournalEntryCreate />
      </AppHero>
      <JournalList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton className="btn btn-primary" />
        </div>
      </div>
    </div>
  );
}
