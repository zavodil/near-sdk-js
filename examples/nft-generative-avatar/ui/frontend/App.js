import 'regenerator-runtime/runtime';
import React from 'react';
import {callJsvm, viewJsvm} from './near-config'
import {Account, utils, providers, Connection } from 'near-api-js';

import './assets/global.css';

import {getGreetingFromContract, setGreetingOnContract} from './near-api';
import {EducationalText, SignInPrompt, SignOutButton} from './ui-components';


export default function App() {
    const [valueFromBlockchain, setValueFromBlockchain] = React.useState();
    const [userNFT, setUserNFT] = React.useState();
    const [headerText, setHeaderText] = React.useState();
    const [userNFTMedia, setUserNFTMedia] = React.useState();
    const [previewTokenStatus, setPreviewTokenStatus] = React.useState()
    const [accountIdToPreview, setAccountIdToPreview] = React.useState()
    const [accountIdToMint, setAccountIdToMint] = React.useState()

    const [uiPleaseWait, setUiPleaseWait] = React.useState(true);

    // Get blockchian state once on component load
    React.useEffect(() => {
        /*
        getGreetingFromContract()
          .then(setValueFromBlockchain)
          .catch(alert)
          .finally(() => {
            setUiPleaseWait(false);
          });*/


        if (window.walletConnection.isSignedIn()) {
            viewJsvm("nft_token", {token_id: window.accountId}).then(token => {
                setUserNFT(token);
                if(token && token.hasOwnProperty("metadata")) {
                    setHeaderText('Your NFT Avatar:');
                    setUserNFTMedia(token.metadata.media);
                }
                else {
                    setHeaderText("Your Avatar wasn't minted yet");
                    setAccountIdToPreview(window.accountId);
                }

                console.log(token);
                setUiPleaseWait(false);
            });
        }

    }, []);

    /// If user not signed-in with wallet - show prompt
    if (!window.walletConnection.isSignedIn()) {

        // Sign-in flow will reload the page later
        return <SignInPrompt greeting={valueFromBlockchain}/>;
    }

    function previewAvatar(e) {
        e.preventDefault();
        setUiPleaseWait(true);
        const {previewAccount} = e.target.elements;

        accountExists(previewAccount.value).then(exists => {
            console.log(exists)
            if(exists){
                setHeaderText(`Avatar of ${previewAccount.value}:`);

                viewJsvm("nft_token", {token_id: previewAccount.value}).then(token => {
                    setUserNFT(token);
                    setUserNFTMedia(token.metadata.media);

                    console.log(token);
                    setUiPleaseWait(false);
                    setPreviewTokenStatus("NFT Avatar already minted");
                }).catch(err => {
                    viewJsvm("nft_token_preview", {token_id: previewAccount.value}).then(token => {
                        setUserNFT(token);
                        setUserNFTMedia(token.metadata.media);

                        console.log(token);
                        setAccountIdToMint(previewAccount.value);
                        setUiPleaseWait(false);
                        setPreviewTokenStatus(`NFT Avatar for ${previewAccount.value} is not minted yet`);
                    });
                })
            }
            else {
                setUserNFTMedia(null);
                setAccountIdToMint(null);
                setPreviewTokenStatus(null);
                setUiPleaseWait(false);
                setHeaderText(`Account ${previewAccount.value} doesn't exist`);
            }
        })


    }

    function mintAvatar(e) {
        e.preventDefault();
        setUiPleaseWait(true);
        callJsvm("nft_mint", {}, utils.format.parseNearAmount("0.005"));
    }

    return (
        <>
            <SignOutButton accountId={window.accountId}/>
            <main className={uiPleaseWait ? 'please-wait' : ''}>
                <h1>
                    {headerText}
                </h1>

                {userNFTMedia && <img src={userNFTMedia} width={"600px"} height={"600px"}
                     onError={() => setUserNFTMedia("https://picsum.photos/200")}/>
                }

                {previewTokenStatus && <div style={{textAlign: 'center', marginTop: "30px"}}>
                    <p>
                        {previewTokenStatus}
                    </p>

                    {accountIdToMint && accountIdToMint === window.accountId &&
                        <form onSubmit={mintAvatar} className="change" style={{marginTop: "30px"}}>
                            <label>Mint this token for {accountIdToMint}</label>
                            <div style={{display: "block", textAlign: "left"}}>
                                <button style={{ borderRadius: "5px"}}>
                                <span>Mint</span>
                                <div className="loader"/>
                            </button>
                        </div>
                    </form>
                }
            </div>
            }

            <form onSubmit={previewAvatar} className="change" style={{marginTop: "30px"}}>
                <label>Preview avatar for Near Account Id:</label>
                <div>
                    <input
                        autoComplete="off"
                        defaultValue={accountIdToPreview}
                        id="previewAccount"
                    />
                    <button>
                        <span>Show</span>
                        <div className="loader"/>
                    </button>
                </div>
            </form>
        </main>
    </>
);
}

async function accountExists(accountId) {
    let connection = getNearAccountConnection();
    try {
        let y = await new Account(connection, accountId).state();
        return true;
    } catch (error) {
        return false;
    }
}

function getNearAccountConnection() {
    if (!window.connection) {
        const provider = new providers.JsonRpcProvider(config.nodeUrl);
        window.connection = new Connection(config.nodeUrl, provider, {});
    }
    return window.connection;
}