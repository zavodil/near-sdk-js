import {NearContract, NearBindgen, call, view, near, LookupMap, Vector} from 'near-sdk-js'
import {Avataaars, getOptions, jenkinsOneAtATimeHash} from './avatars.js';

function assert(b, str) {
    if (b) {
        return
    } else {
        throw Error("assertion failed: " + str)
    }
}

class Token {
    constructor(token_id, owner_id) {
        this.token_id = token_id;
        this.owner_id = owner_id;
    }
}


class NftTokenMetadata {
    constructor(token_id) {
        this.title = `Avatar of ${token_id}`;
        this.description = "";
        this.media = toDataUri(encodeURIComponent(Avataaars.create(token_id)));
        this.media_hash = "";
        this.copies = "";
        this.issued_at = "";
        this.expires_at = "";
        this.starts_at = "";
        this.updated_at = "";
        this.extra = "";
        this.reference = "";
        this.reference_hash = "";
    }
}

class TokenOutput {
    constructor(token_id, owner_id) {
        this.token_id = token_id;
        this.owner_id = owner_id;
        this.metadata = new NftTokenMetadata(token_id);
        this.approved_account_ids = [];
    }
}


class NftContractMetadata {
    constructor() {
        this.spec = "nft-1.0.0";
        this.name = "NFT Pattern";
        this.symbol = "PTRN";
        this.icon = "";
        this.base_uri = "";
        this.reference = "";
        this.reference_hash = "";
    }
}

@NearBindgen
class NftContract extends NearContract {
    constructor({ owner_id, owner_by_id_prefix, token_ids_prefix}) {
        super()
        assert(owner_id !== null, "Owner not found")
        assert(owner_by_id_prefix !== null, "Prefix not found")
        near.log(`Owner: ${owner_id}`);
        this.owner_id = owner_id
        this.owner_by_id = new LookupMap(owner_by_id_prefix)
        this.token_ids = new Vector(token_ids_prefix)
        this.total_supply = 0;
    }

    deserialize() {
        super.deserialize()
        this.owner_by_id = Object.assign(new LookupMap, this.owner_by_id)
        this.token_ids = Object.assign(new Vector, this.token_ids);
    }

    internalTransfer({ sender_id, receiver_id, token_id, approval_id, memo }) {
        let owner_id = this.owner_by_id.get(token_id)

        assert(owner_id !== null, "Token not found")
        assert(sender_id === owner_id, "Sender must be the current owner")
        assert(owner_id !== receiver_id, "Current and next owner must differ")

        this.owner_by_id.set(token_id, receiver_id)

        return owner_id
    }

    @call
    nft_transfer({ receiver_id, token_id, approval_id, memo }) {
        let sender_id = near.predecessorAccountId()
        this.internalTransfer({ sender_id, receiver_id, token_id, approval_id, memo })
    }

    @call
    nft_transfer_call({ receiver_id, token_id, approval_id, memo, msg }) {
        let sender_id = near.predecessorAccountId()
        let old_owner_id = this.internalTransfer({ sender_id, receiver_id, token_id, approval_id, memo })

        let onTransferRet = near.jsvmCall(receiver_id, 'nft_on_transfer', { senderId: sender_id, previousOwnerId: old_owner_id, tokenId: token_id, msg: msg })

        // NOTE: Arbitrary logic can be run here, as an example we return the token to the initial
        // owner if receiver's `nftOnTransfer` returns `true`
        if (onTransferRet) {
            let currentOwner = this.owner_by_id.get(token_id)
            if (currentOwner === null) {
                // The token was burned and doesn't exist anymore.
                return true
            } else if (currentOwner !== receiver_id) {
                // The token is not owned by the receiver anymore. Can't return it.
                return true
            } else {
                this.internalTransfer({ sender_id: receiver_id, receiver_id: sender_id, token_id: token_id, approval_id: null, memo: null })
                return false
            }
        } else {
            return true
        }
    }

    @call
    nft_mint({ }) {
        //token_owner_id = !token_owner_id ? near.predecessorAccountId() : token_owner_id;
        let token_owner_id = near.predecessorAccountId();
        assert(this.token_ids.toArray().includes(token_owner_id) === false, "Token for this user already exists")

        this.owner_by_id.set(token_owner_id, token_owner_id);
        this.token_ids.push(token_owner_id)
        this.total_supply += 1;

        near.log(`EVENT_JSON:{"standard":"nep171","version":"1.0.0","event":"nft_mint","data":[{"owner_id":"${token_owner_id}","token_ids":["${token_owner_id}"]}]}`);

        return new Token(token_owner_id, token_owner_id)
    }

    @view
    nft_total_supply({}){
        this.total_supply.toString()
    }

    @view
    nft_token({ token_id }) {
        let owner_id = this.owner_by_id.get(token_id)
        if (owner_id === null) {
            return null
        }

        return new TokenOutput(token_id, owner_id)
    }

    @view
    nft_token_preview({ token_id }) {
        return new TokenOutput(token_id, token_id)
    }

    @view
    get_owner ({}) {
        return this.owner_id.toString()
    }

    @view nft_metadata ({}) {
        return new NftContractMetadata();
    }

    @view
    get_options ({token_id}) {
        return (JSON.stringify(getOptions(token_id)));
    }

    @view
    get_seed ({token_id}) {
        return jenkinsOneAtATimeHash(token_id).toString();
    }

    @view
    get_token_ids ({}) {
        return this.token_ids.toArray();
    }

    @view
    token_exists ({token_id}) {
        return this.token_ids.toArray().includes(token_id);
    }

    @view
    get_token_by_id ({token_id}) {
        return this.token_ids.get(token_id);
    }
}

function toDataUri (str) {
    return 'data:image/svg+xml;utf8,' + str.toString();
}