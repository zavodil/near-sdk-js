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
        this.name = "NFT Avatar";
        this.symbol = "AVATAR";
        this.icon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' id='Layer_1' x='0px' y='0px' viewBox='0 0 512.001 512.001' style='enable-background:new 0 0 512.001 512.001;' xml:space='preserve'%3E%3Cscript xmlns=''/%3E%3Cscript xmlns=''/%3E%3Cg%3E%3Cpath style='fill:%23FFA055;' d='M213.463,508.462c-4.091-0.687-8.153-1.464-12.176-2.343 C205.311,506.997,209.371,507.777,213.463,508.462z'/%3E%3Cpath style='fill:%23FFA055;' d='M218.486,509.256c-1.085-0.16-2.167-0.327-3.247-0.501 C216.321,508.929,217.402,509.097,218.486,509.256z'/%3E%3Cpath style='fill:%23FFA055;' d='M310.714,506.119c-4.023,0.879-8.085,1.656-12.176,2.343 C302.63,507.777,306.69,506.997,310.714,506.119z'/%3E%3Cpath style='fill:%23FFA055;' d='M231.191,510.8c-0.776-0.075-1.552-0.15-2.327-0.231C229.639,510.65,230.415,510.725,231.191,510.8z '/%3E%3Cpath style='fill:%23FFA055;' d='M243.874,511.706c-0.485-0.023-0.97-0.04-1.454-0.065 C242.905,511.666,243.389,511.685,243.874,511.706z'/%3E%3Cpath style='fill:%23FFA055;' d='M250.122,511.926c-0.563-0.013-1.125-0.03-1.687-0.046 C248.997,511.896,249.559,511.913,250.122,511.926z'/%3E%3Cpath style='fill:%23FFA055;' d='M236.875,511.289c-0.641-0.048-1.28-0.104-1.919-0.155 C235.595,511.186,236.234,511.242,236.875,511.289z'/%3E%3Cpath style='fill:%23FFA055;' d='M296.761,508.757c-1.08,0.174-2.162,0.341-3.247,0.501 C294.599,509.097,295.681,508.929,296.761,508.757z'/%3E%3Cpath style='fill:%23FFA055;' d='M225.017,510.128c-1.293-0.157-2.583-0.325-3.87-0.501 C222.434,509.803,223.723,509.973,225.017,510.128z'/%3E%3Cpath style='fill:%23FFA055;' d='M269.581,511.641c-0.483,0.025-0.969,0.043-1.454,0.065 C268.612,511.685,269.097,511.666,269.581,511.641z'/%3E%3Cpath style='fill:%23FFA055;' d='M178.286,499.953c-0.562-0.179-1.12-0.369-1.681-0.551c-0.574-0.187-1.149-0.373-1.72-0.563 c-1.923-0.64-3.84-1.293-5.741-1.978v-0.026c-17.453-6.309-34.029-14.451-49.489-24.203l6.525-97.875 c1.08-16.198,12.71-29.745,28.557-33.267l39.624-8.805l-2.36-3.541L210.286,320v-18.286l-22.726-9.09 c-13.885-5.553-22.989-19.001-22.989-33.955v-20.954c-10.099,0-18.286-8.187-18.286-18.286c0-6.501,3.402-12.194,8.513-15.437 l-4.493-44.925c-1.335-13.345,4.658-25.592,14.558-32.977c1.147-10.178,5.873-19.237,15.707-26.281 c25.523-18.286,185.143-26.666,185.143-26.666l-11.329,54.461c-0.381,1.382-0.845,2.706-1.346,4.005 c6.265,7.29,9.697,17.038,8.655,27.459l-4.493,44.925c5.111,3.242,8.513,8.936,8.513,15.437c0,10.098-8.186,18.286-18.286,18.286 v20.954c0,14.954-9.104,28.402-22.989,33.955l-22.726,9.09V320l18.286,9.143l-2.359,3.539l39.624,8.805 c15.848,3.522,27.477,17.071,28.557,33.267l6.525,97.875c-15.462,9.752-32.038,17.895-49.489,24.203v0.026 c-1.902,0.686-3.818,1.339-5.741,1.978c-0.571,0.191-1.146,0.376-1.72,0.563c-0.561,0.183-1.119,0.373-1.681,0.551v-0.008 c-7.495,2.392-15.137,4.455-22.914,6.157C425.85,481.007,512.001,378.573,512.001,256c0-141.385-114.615-256-256-256 s-256,114.615-256,256c0,122.573,86.151,225.007,201.2,250.101c-7.777-1.702-15.419-3.765-22.914-6.157V499.953z'/%3E%3Cpath style='fill:%23FFA055;' d='M290.854,509.629c-1.287,0.176-2.577,0.344-3.87,0.501 C288.278,509.973,289.567,509.803,290.854,509.629z'/%3E%3Cpath style='fill:%23FFA055;' d='M277.046,511.134c-0.64,0.051-1.278,0.109-1.919,0.155 C275.767,511.242,276.406,511.186,277.046,511.134z'/%3E%3Cpath style='fill:%23FFA055;' d='M283.137,510.569c-0.774,0.081-1.551,0.155-2.327,0.231 C281.586,510.725,282.362,510.65,283.137,510.569z'/%3E%3Cpath style='fill:%23FFA055;' d='M261.879,511.926c0.563-0.013,1.125-0.03,1.687-0.046 C263.004,511.896,262.442,511.913,261.879,511.926z'/%3E%3C/g%3E%3Cg%3E%3Cpath style='fill:%23B4EBBE;' d='M268.127,511.706c0.485-0.023,0.97-0.04,1.454-0.065c1.854-0.097,3.703-0.215,5.546-0.352 c0.641-0.048,1.28-0.104,1.919-0.155c1.257-0.103,2.512-0.214,3.763-0.334c0.776-0.075,1.552-0.15,2.327-0.231 c1.286-0.136,2.568-0.286,3.849-0.44c1.293-0.157,2.583-0.325,3.87-0.501c0.888-0.121,1.775-0.241,2.661-0.373 c1.085-0.16,2.167-0.327,3.247-0.501c0.593-0.095,1.185-0.194,1.777-0.294c4.091-0.687,8.153-1.464,12.176-2.343 c0.029-0.006,0.057-0.013,0.087-0.018c7.777-1.702,15.419-3.765,22.914-6.157v-91.65c0-10.991,4.281-21.33,12.049-29.098 l28.568-28.563c2.237,2.107,4.246,4.439,5.89,7.038l-27.993,27.99c-6.045,6.045-9.37,14.08-9.37,22.634v88.538 c17.453-6.309,34.029-14.451,49.489-24.203l-6.525-97.875c-1.08-16.198-12.71-29.745-28.557-33.267l-39.624-8.805L289.62,374.72 c-3.2,4.801-9.993,5.473-14.072,1.393l-14.976-14.97v150.741c-1.527,0.026-3.038,0.117-4.571,0.117c1.966,0,3.923-0.03,5.879-0.074 c0.563-0.013,1.125-0.03,1.687-0.046C265.09,511.835,266.61,511.778,268.127,511.706z'/%3E%3Cpath style='fill:%23B4EBBE;' d='M337.117,498.838c-0.573,0.191-1.146,0.377-1.72,0.563 C335.97,499.215,336.545,499.029,337.117,498.838z'/%3E%3Cpath style='fill:%23B4EBBE;' d='M176.605,499.402c-0.574-0.186-1.147-0.374-1.72-0.563 C175.457,499.029,176.031,499.215,176.605,499.402z'/%3E%3Cpath style='fill:%23B4EBBE;' d='M251.429,361.143l-14.971,14.971c-4.08,4.08-10.872,3.407-14.072-1.393l-28.025-42.039 l-39.624,8.805c-15.848,3.522-27.477,17.071-28.557,33.267l-6.525,97.875c15.462,9.752,32.038,17.895,49.489,24.203v-88.538 c0-8.553-3.326-16.59-9.37-22.634l-27.993-27.99c1.643-2.599,3.654-4.93,5.89-7.038l28.568,28.563 c7.768,7.768,12.049,18.107,12.049,29.098v91.65c7.495,2.392,15.137,4.455,22.914,6.157c0.029,0.006,0.058,0.013,0.087,0.018 c4.023,0.879,8.085,1.656,12.176,2.343c0.592,0.099,1.184,0.199,1.777,0.294c1.08,0.174,2.162,0.341,3.247,0.501 c0.885,0.13,1.773,0.251,2.661,0.373c1.287,0.176,2.577,0.344,3.87,0.501c1.28,0.155,2.562,0.304,3.849,0.44 c0.774,0.081,1.551,0.155,2.327,0.231c1.251,0.12,2.506,0.232,3.763,0.334c0.64,0.051,1.278,0.109,1.919,0.155 c1.843,0.137,3.691,0.255,5.546,0.352c0.483,0.025,0.969,0.043,1.454,0.065c1.517,0.072,3.038,0.129,4.561,0.174 c0.562,0.016,1.125,0.033,1.687,0.046c1.954,0.045,3.913,0.074,5.879,0.074c-1.534,0-3.045-0.089-4.571-0.117V361.143H251.429z'/%3E%3C/g%3E%3Cpath style='fill:%23EBC89B;' d='M269.583,314.567c-8.719,3.488-18.446,3.488-27.165,0l-32.133-12.853V320l45.714,36.571L301.715,320 v-18.286L269.583,314.567z'/%3E%3Cg%3E%3Cpath style='fill:%23968687;' d='M318.748,155.429h10.395c10.099,0,18.286,8.187,18.286,18.286v27.429 c3.598,0,6.943,1.054,9.773,2.849l4.493-44.925c1.042-10.422-2.391-20.168-8.655-27.459 C347.377,146.251,334.231,155.429,318.748,155.429z'/%3E%3Cpath style='fill:%23968687;' d='M164.572,173.714c0-10.098,8.186-18.286,18.286-18.286h5.911c-11.833,0-21.666-8.501-23.767-19.723 c-0.114-0.605-0.21-1.215-0.28-1.833c-0.014-0.122-0.024-0.246-0.035-0.369c-0.072-0.747-0.114-1.504-0.114-2.27l0,0l0,0l0,0 c0,0,0-0.002,0-0.003c0-1.742,0.103-3.453,0.293-5.138c-9.899,7.385-15.893,19.632-14.558,32.977l4.493,44.925 c2.829-1.794,6.174-2.849,9.773-2.849L164.572,173.714L164.572,173.714z'/%3E%3C/g%3E%3Cpath style='fill:%23F5DCAA;' d='M269.583,314.567l32.131-12.853l22.726-9.09c13.885-5.553,22.989-19.001,22.989-33.955v-20.954 c10.099,0,18.286-8.187,18.286-18.286c0-6.501-3.402-12.194-8.513-15.437c-2.829-1.794-6.174-2.849-9.773-2.849v-27.429 c0-10.098-8.186-18.286-18.286-18.286h-10.395H201.143h-12.375h-5.911c-10.099,0-18.286,8.187-18.286,18.286v27.429 c-3.598,0-6.943,1.054-9.773,2.849c-5.111,3.242-8.513,8.936-8.513,15.437c0,10.098,8.186,18.286,18.286,18.286v20.954 c0,14.954,9.104,28.402,22.989,33.955l22.726,9.09l32.131,12.853C251.138,318.055,260.863,318.055,269.583,314.567z M227.031,263.312c2.277-4.509,7.777-6.321,12.281-4.045c9.197,4.625,24.178,4.625,33.375,0c4.531-2.295,10.009-0.464,12.281,4.045 s0.459,10.009-4.049,12.277c-7.205,3.634-15.821,5.554-24.919,5.554c-9.098,0-17.714-1.92-24.92-5.553 C226.572,273.321,224.759,267.822,227.031,263.312z M301.715,201.143c5.049,0,9.143,4.094,9.143,9.143v9.143 c0,5.049-4.094,9.143-9.143,9.143s-9.143-4.094-9.143-9.143v-9.143C292.572,205.237,296.666,201.143,301.715,201.143z M201.143,219.429v-9.143c0-5.049,4.094-9.143,9.143-9.143c5.049,0,9.143,4.094,9.143,9.143v9.143c0,5.049-4.094,9.143-9.143,9.143 C205.237,228.571,201.143,224.478,201.143,219.429z'/%3E%3Cg%3E%3Cpath style='fill:%23464655;' d='M219.429,219.429v-9.143c0-5.049-4.094-9.143-9.143-9.143c-5.049,0-9.143,4.094-9.143,9.143v9.143 c0,5.049,4.094,9.143,9.143,9.143C215.335,228.571,219.429,224.478,219.429,219.429z'/%3E%3Cpath style='fill:%23464655;' d='M301.715,228.571c5.049,0,9.143-4.094,9.143-9.143v-9.143c0-5.049-4.094-9.143-9.143-9.143 s-9.143,4.094-9.143,9.143v9.143C292.572,224.478,296.666,228.571,301.715,228.571z'/%3E%3Cpath style='fill:%23464655;' d='M265.429,124.571c0,0,17.674-8.215,32.822-18.714c-9.573,1.882-20.376,3.338-32.536,4.143 c-61.918,4.097-96.286,5.714-100.619,26.213c-0.035-0.167-0.062-0.338-0.094-0.507c2.101,11.224,11.934,19.723,23.767,19.723 h12.375h117.605c15.483,0,28.629-9.177,34.29-23.821c0.502-1.298,0.967-2.623,1.346-4.005l11.33-54.461 C365.715,73.143,339.715,121.143,265.429,124.571z'/%3E%3Cpath style='fill:%23464655;' d='M164.723,133.872c-0.014-0.122-0.024-0.247-0.035-0.369 C164.698,133.625,164.709,133.749,164.723,133.872z'/%3E%3C/g%3E%3Cpath style='fill:%235C5D6E;' d='M164.572,131.232L164.572,131.232c0,0.767,0.042,1.523,0.114,2.271 c0.011,0.122,0.022,0.247,0.035,0.369c0.069,0.619,0.166,1.229,0.28,1.833c0.032,0.169,0.058,0.339,0.094,0.507 c4.334-20.498,38.702-22.114,100.619-26.213c12.16-0.805,22.963-2.261,32.536-4.143c-15.147,10.499-32.822,18.714-32.822,18.714 c74.286-3.429,100.286-51.429,100.286-51.429s-159.619,8.381-185.143,26.666c-9.833,7.045-14.56,16.103-15.707,26.281 c-0.19,1.685-0.293,3.397-0.293,5.138C164.572,131.23,164.572,131.231,164.572,131.232z'/%3E%3Cg%3E%3Cpath style='fill:%239BDCB4;' d='M260.572,361.143l14.971,14.971c4.08,4.08,10.872,3.407,14.072-1.393l28.025-42.039l2.36-3.539 L301.715,320l-45.714,36.571L210.286,320l-18.286,9.143l2.359,3.539l28.025,42.039c3.2,4.801,9.993,5.473,14.072,1.393 l14.973-14.971v150.741c1.527,0.026,3.038,0.117,4.571,0.117c1.534,0,3.045-0.089,4.571-0.117V361.143z'/%3E%3Cpath style='fill:%239BDCB4;' d='M335.396,499.402c0.574-0.186,1.147-0.374,1.72-0.563c1.923-0.64,3.84-1.293,5.741-1.978v-0.026 v-88.538c0-8.553,3.326-16.59,9.37-22.634l27.993-27.99c-1.643-2.599-3.654-4.93-5.89-7.038l-28.568,28.563 c-7.766,7.767-12.047,18.106-12.047,29.097v91.65v0.008C334.277,499.774,334.835,499.584,335.396,499.402z'/%3E%3Cpath style='fill:%239BDCB4;' d='M174.884,498.838c0.573,0.191,1.146,0.377,1.72,0.563c0.561,0.183,1.119,0.373,1.681,0.551v-0.008 v-91.65c0-10.991-4.281-21.33-12.049-29.098l-28.568-28.563c-2.237,2.107-4.246,4.439-5.89,7.038l27.993,27.99 c6.045,6.045,9.37,14.08,9.37,22.634v88.538v0.026C171.045,497.545,172.962,498.199,174.884,498.838z'/%3E%3C/g%3E%3Cpath style='fill:%23DCB491;' d='M231.081,275.59c7.206,3.633,15.822,5.553,24.92,5.553c9.098,0,17.714-1.92,24.92-5.553 c4.509-2.267,6.321-7.768,4.049-12.277c-2.272-4.509-7.75-6.339-12.281-4.045c-9.197,4.625-24.178,4.625-33.375,0 c-4.504-2.277-10.005-0.464-12.281,4.045C224.759,267.822,226.572,273.321,231.081,275.59z'/%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3C/svg%3E";
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
        //near.log(`Owner: ${owner_id}`);
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

        this.owner_by_id.set(token_id, receiver_id);

        near.log(`EVENT_JSON:{"standard":"nep171","version":"1.0.0","event":"nft_transfer ","data":[{"old_owner_id":"${sender_id}","new_owner_id":"${receiver_id}", "token_ids":["${token_id}"]}]}`);

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

    @view
    nft_metadata ({}) {
        return new NftContractMetadata();
    }

    @view
    nft_token_metadata({ token_id }){
        return new NftTokenMetadata(token_id);
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

    @view
    nft_supply_for_owner ({account_id}) {
        return this.token_ids.toArray()
            .filter(token_id => this.owner_by_id.get(token_id) === account_id).length.toString();
    }

    @view
    nft_tokens_for_owner ({account_id, from_index, limit}) {
        from_index = from_index || 0;
        let tokens = this.token_ids.toArray()
            .filter(token_id => this.owner_by_id.get(token_id) === account_id);

        from_index = Math.min(from_index, tokens.length);
        limit = Math.max(0, tokens.length - from_index);

        return tokens
            .slice(from_index, from_index + limit)
            .map(token_id => new TokenOutput(token_id, this.owner_by_id.get(token_id)));
    }

    @view
    nft_tokens_for_owner_set ({account_id, from_index, limit}) {
        from_index = from_index || 0;

        let tokens = this.token_ids.toArray()
            .filter(token_id => this.owner_by_id.get(token_id) === account_id);

        limit = limit || tokens.length;

        from_index = Math.min(from_index, tokens.length);
        limit = Math.min(limit, tokens.length - from_index);

        return tokens
            .slice(from_index, from_index + limit);
    }

}

function toDataUri (str) {
    return 'data:image/svg+xml;utf8,' + str.toString();
}