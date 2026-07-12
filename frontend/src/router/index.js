/**
 * Lightweight Client-Side Router for Vanilla JS Single Page Applications
 */
export class Router {
  /**
   * @param {Array<{path: string, render: () => string|Promise<string>}>} routes 
   * @param {string} containerId - Target element ID to render content
   */
  constructor(routes, containerId = 'app') {
    this.routes = routes;
    this.container = document.getElementById(containerId);

    // Watch for back/forward browser navigation
    window.addEventListener('popstate', () => this.handleRoute());

    // Delegate click events globally to intercept data-link navigations
    document.addEventListener('click', (e) => {
      // Find closest link containing the [data-link] attribute
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        const targetUrl = link.getAttribute('href');
        if (targetUrl) {
          this.navigateTo(targetUrl);
        }
      }
    });
  }

  /**
   * Perform programatic navigation updates
   * @param {string} url - Target URL path
   */
  navigateTo(url) {
    window.history.pushState(null, null, url);
    this.handleRoute();
  }

  /**
   * Route handler matching window.location.pathname against declared routes
   */
  async handleRoute() {
    const currentPath = window.location.pathname;
    
    // Find matching route or match wildcard * for 404
    let matchedRoute = this.routes.find((route) => route.path === currentPath);

    if (!matchedRoute) {
      matchedRoute = this.routes.find((route) => route.path === '*') || {
        render: () => '<h1>404 Not Found</h1>'
      };
    }

    // Render component view template inside parent container
    if (this.container) {
      try {
        const viewContent = await matchedRoute.render();
        this.container.innerHTML = viewContent;
        if (matchedRoute.onMount) {
          matchedRoute.onMount();
        }
      } catch (error) {
        console.error('Route render failure:', error);
        this.container.innerHTML = `
          <div class="container py-5 text-center text-danger">
            <h3>Render error occurred</h3>
            <p>${error.message}</p>
          </div>
        `;
      }
    }
  }
}
