async function initialiseHeader() {
    const html = await fetch("./scripts/components/headers/headers.html")
    const js = await fetch("./scripts/components/headers/headers.js")
    document.getElementById("headerRoot").innerHTML = await html.text()
    const script = document.createElement("script")
    script.textContent = await js.text()
    script.defer = true
    document.getElementById("headerRoot").append(script)
}

class Router {
    constructor(parentElement) {
        this.root = parentElement
    }
    async go(route) {
        // todo load html
        // append non script components
        // execute scripts
    }
}

(async () => {
    // initilise auth and api 
    const auth = new Auth()
    window.auth = auth
    // intialise components
    await initialiseHeader()
})()