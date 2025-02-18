// creating a bonk bot type thing that only throws pubkey and manages the privatekey by itself

import { Transaction, PublicKey, SystemProgram } from "@solana/web3.js";
import axios from "axios";
import { Connection } from "mongoose";

const connection = new Connection("https://api.devnet.solana.com");
const fromPubkey = new PublicKey("source public key");

function App() {
  async function SendSol() {
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromPubkey,
        toPubkey: new PublicKey("destination public key"),
        lamports: 0.001 * 1000000000,
      })
    );
    // Transfer here is an instruction to transfer lamports from one account to another
  
    // dont have my rivate key with me
  
    // Convert the transaction object to bunch of bytes
  
    const {blockhash} = await connection.getRecentBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = fromPubkey;

    const serializedTx = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
  
    await axios.post("/api/v1/txn/sign", {
      message: serializedTx,
      retry: false,
    });
    return <div></div>;
  }
  return (
    <>
    <div>
      <input type="text" placeholder='Ammount' />
      <input type="text" placeholder='Address' />
      <button onClick={SendSol}>Submit</button>
    </div>
    </>
  )
}

export default App
