import { PublicKey, Transaction, Connection } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from "@solana/spl-token";

export const ZRA_MINT = new PublicKey("3Jz9qH8kB8EyJJu8W1Mj5AS4GX54xJFfcnNNuWZ35bZE");
export const ZRA_DECIMALS = 9;

// Treasury/vault wallet for staking & liquidity deposits
// In production, replace with a proper program-derived address (PDA)
export const ZRA_VAULT = new PublicKey("2JgxWdxKRgzfJV3AEarCCKtQ4WNMbk52f6kBqHxYjpnJ");

/**
 * Get the ZRA token balance for a wallet
 */
export async function getZraBalance(
  connection: Connection,
  walletPubkey: PublicKey
): Promise<number> {
  try {
    const ata = await getAssociatedTokenAddress(ZRA_MINT, walletPubkey);
    const account = await getAccount(connection, ata);
    return Number(account.amount) / Math.pow(10, ZRA_DECIMALS);
  } catch (e) {
    if (e instanceof TokenAccountNotFoundError || e instanceof TokenInvalidAccountOwnerError) {
      return 0;
    }
    throw e;
  }
}

/**
 * Build a transaction to transfer ZRA tokens from the user to the vault
 */
export async function buildZraTransferTx(
  connection: Connection,
  fromPubkey: PublicKey,
  amount: number
): Promise<Transaction> {
  const lamports = BigInt(Math.floor(amount * Math.pow(10, ZRA_DECIMALS)));

  const fromAta = await getAssociatedTokenAddress(ZRA_MINT, fromPubkey);
  const toAta = await getAssociatedTokenAddress(ZRA_MINT, ZRA_VAULT);

  const tx = new Transaction();

  // Create vault ATA if it doesn't exist
  try {
    await getAccount(connection, toAta);
  } catch (e) {
    if (e instanceof TokenAccountNotFoundError || e instanceof TokenInvalidAccountOwnerError) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          fromPubkey, // payer
          toAta,
          ZRA_VAULT,
          ZRA_MINT
        )
      );
    }
  }

  tx.add(
    createTransferInstruction(
      fromAta,
      toAta,
      fromPubkey,
      lamports
    )
  );

  const { blockhash } = await connection.getLatestBlockhash();
  tx.feePayer = fromPubkey;
  tx.recentBlockhash = blockhash;

  return tx;
}
