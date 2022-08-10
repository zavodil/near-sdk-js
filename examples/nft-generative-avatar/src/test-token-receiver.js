import { NearContract, NearBindgen, call, near } from 'near-sdk-js'

function assert(b, str) {
    if (b) {
        return
    } else {
        throw Error("assertion failed: " + str)
    }
}

@NearBindgen
class NftContract extends NearContract {
    constructor({ nonFungibleTokenAccountId }) {
        super()
        this.nonFungibleTokenAccountId = nonFungibleTokenAccountId
    }

    @call
    nft_on_transfer({ senderId, previousOwnerId, tokenId, msg }) {
        assert(
            near.predecessorAccountId() === this.nonFungibleTokenAccountId,
            "Only supports the one non-fungible token contract"
        )
        if (msg === "return-it-now") {
            return true
        } else if (msg === "keep-it-now") {
            return false
        } else {
            throw Error("unsupported msg")
        }
    }
}
