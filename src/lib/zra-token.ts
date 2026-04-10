import { PublicKey, Transaction, Connection } from "@solana/web3.js";

export const ZRA_MINT = new PublicKey("3Jz9qH8kB8EyJJu8W1Mj5AS4GX54xJFfcnNNuWZ35bZE");
export const ZRA_DECIMALS = 9;

// Treasury/vault wallet for staking & liquidity deposits
export const ZRA_VAULT = new PublicKey("2JgxWdxKRgzfJV3AEarCCKtQ4WNMbk52f6kBqHxYjpnJ");

/**
 * Dynamically import @solana/spl-token to avoid top-level Buffer issues
 */
async function getSplToken() {
  // Ensure Buffer is available
  if (typeof globalThis.Buffer === "undefined") {
    const { Buffer } = await import("buffer");
    globalThis.Buffer = Buffer;
  }
  return await import("@solana/spl-token");
}

/**
 * Get the ZRA token balance for a wallet
 */
export async function getZraBalance(
  connection: Connection,
  walletPubkey: PublicKey
): Promise<number> {
  try {
    const { getAssociatedTokenAddress, getAccount, TokenAccountNotFoundError, TokenInvalidAccountOwnerError } = await getSplToken();
    const ata = await getAssociatedTokenAddress(ZRA_MINT, walletPubkey);
    const account = await getAccount(connection, ata);
    return Number(account.amount) / Math.pow(10, ZRA_DECIMALS);
  } catch (e: any) {
    // Check by name since instanceof may not work across dynamic imports
    if (e?.name === "TokenAccountNotFoundError" || e?.name === "TokenInvalidAccountOwnerError") {
      return 0;
    }
    console.error("Failed to get ZRA balance:", e);
    return 0;
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
  const { getAssociatedTokenAddress, getAccount, createAssociatedTokenAccountInstruction, createTransferInstruction } = await getSplToken();

  const lamports = BigInt(Math.floor(amount * Math.pow(10, ZRA_DECIMALS)));

  const fromAta = await getAssociatedTokenAddress(ZRA_MINT, fromPubkey);
  const toAta = await getAssociatedTokenAddress(ZRA_MINT, ZRA_VAULT);

  const tx = new Transaction();

  // Create vault ATA if it doesn't exist
  try {
    await getAccount(connection, toAta);
  } catch (e: any) {
    if (e?.name === "TokenAccountNotFoundError" || e?.name === "TokenInvalidAccountOwnerError") {
      tx.add(
        createAssociatedTokenAccountInstruction(
          fromPubkey,
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
