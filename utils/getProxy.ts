import {readWallets} from "./wallet";
import {random} from "./common";
import {HttpsProxyAgent} from "https-proxy-agent"

let proxies = readWallets('./proxies.txt')

export const getProxy = () => {
    let agent
    let proxy = null
    if (proxies.length) {
        proxy = proxies[random(0, proxies.length)]
    }

    if (proxy) {
        agent = new HttpsProxyAgent(proxy)
    }

    return agent
}