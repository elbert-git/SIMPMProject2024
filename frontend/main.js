class Router {
  constructor(parentElement) {
    this.root = parentElement;
    this.goHome();
  }
  async go(route) {
    // clear router
    this.root.innerHTML = "";
    //prevent un-authenticated routing
    await window.render.fromURL(route, this.root);
  }
  async goHome() {
    // based on auth state route to correct page
    if (window.auth.state.credentials) {
      if (window.auth.state.credentials.isStaff) {
        this.go("./pages/admin-dashboard.html");
      } else {
        this.go("./pages/student-dashboard.html");
      }
    } else {
      this.go("./pages/home.html");
    }
  }
}

(async () => {
  // initilise auth and api
  const auth = new Auth();
  window.auth = auth;
  //initialse router
  const router = new Router(document.getElementById("routerRoot"));
  window.router = router;
  // intialise components
  // header
  await window.render.fromURL(
    "./pages/headers.html",
    document.getElementById("headerRoot")
  );
  // todo initialise drawer
})();
