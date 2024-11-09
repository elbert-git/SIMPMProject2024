// get auth
const auth = window.auth
const credentials = auth.state.credentials;
// toggle visibility based on auth state
if (credentials) {
    document.querySelector(".header-right-section").classList.remove("hide");
    document.querySelector("#nameLabel").innerHTML = credentials.userName
}
document.getElementById("logoutButton").addEventListener("click", () => {
    // logout
    auth.logout();
    // referesh
    location.reload();
});