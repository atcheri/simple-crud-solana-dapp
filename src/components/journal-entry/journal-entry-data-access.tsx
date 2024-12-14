"use client";

import {
  CRUD_PROGRAM_ID as programId,
  getJournalEntryProgram,
} from "@project/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";
import { PublicKey } from "@solana/web3.js";

type CreateEntryArgs = {
  title: string;
  message: string;
  owner: PublicKey;
};

export function useJournalEntryProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const program = getJournalEntryProgram(provider);

  const accounts = useQuery({
    queryKey: [`journal-entry`, `all`, { cluster }],
    queryFn: () => program.account.journalEntryState.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ["journal-entry", "create", { cluster }],
    mutationFn: ({ title, message, owner }) =>
      program.methods.createJournalEntry(title, message).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) =>
      toast.error(`Failed to create the journal entry: ${error.message}`),
  });

  return {
    accounts,
    program,
    programId,
    getProgramAccount,
    createEntry,
  };
}

export const useJournalEntryProgramAccount = ({
  account,
}: {
  account: PublicKey;
}) => {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useJournalEntryProgram();

  const accountQuery = useQuery({
    queryKey: ["journal-entry", "fetch", { cluster, account }],
    queryFn: () => program.account.journalEntryState.fetch(account),
  });

  const updateEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ["journal-entry", "update", { cluster }],

    mutationFn: ({ title, message }) =>
      program.methods.updateJournalEntry(title, message).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) =>
      toast.error(`Failed to update the journal entry: ${error.message}`),
  });

  const deleteEntry = useMutation({
    mutationKey: ["journal-entry", "delete", { cluster }],
    mutationFn: (title: string) =>
      program.methods.deleteJournalEntry(title).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) =>
      toast.error(`Failed to delete the journal entry: ${error.message}`),
  });

  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  };
};
