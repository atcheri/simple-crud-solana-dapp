// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import CrudIDL from "../target/idl/crud.json";
import type { Crud } from "../target/types/crud";

// Re-export the generated IDL and type
export { Crud, CrudIDL };

// The programId is imported from the program IDL.
export const CRUD_PROGRAM_ID = new PublicKey(CrudIDL.address);

// This is a helper function to get the Basic Anchor program.
export function getJournalEntryProgram(provider: AnchorProvider) {
  return new Program(CrudIDL as Crud, provider);
}
