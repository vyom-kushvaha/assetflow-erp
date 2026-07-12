/**
 * Page component representing user Login / Signup registration.
 */
export const LoginPage = {
  render() {
    return `
      <div class="row min-vh-100 g-0">
        <!-- Left Side: Brand Panel (60%) -->
        <section class="col-lg-7 bg-primary position-relative overflow-hidden d-none d-lg-flex flex-column p-5 justify-content-between border-end border-white border-opacity-10">
          <!-- Abstract Illustration Background -->
          <div class="position-absolute inset-0 asset-grid opacity-25" style="top: 0; left: 0; right: 0; bottom: 0;"></div>
          
          <!-- Abstract Elements (Conceptual Assets) -->
          <div class="position-absolute w-100 h-100 top-0 start-0 pointer-events-none">
            <div class="position-absolute border border-2 border-warning rounded" style="top: 20%; left: 30%; width: 96px; height: 96px; opacity: 0.4;"></div>
            <div class="position-absolute border border-2 border-warning rounded rotate-12" style="top: 45%; left: 60%; width: 128px; height: 128px; opacity: 0.3;"></div>
            <div class="position-absolute bg-warning rounded" style="top: 70%; left: 25%; width: 64px; height: 64px; opacity: 0.2;"></div>
            <div class="position-absolute bg-warning rounded-circle" style="top: 15%; left: 80%; width: 32px; height: 32px; opacity: 0.4;"></div>
          </div>

          <div class="position-relative z-3">
            <div class="d-flex align-items-center gap-3 mb-5">
              <div class="bg-warning rounded d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                <span class="fw-bold text-white text-lg headline-font">AF</span>
              </div>
              <h2 class="h3 text-white m-0 tracking-tight headline-font">AssetFlow</h2>
            </div>
            <div class="max-w-md" style="max-width: 480px;">
              <h1 class="display-4 text-white mb-4 lh-sm headline-font fw-bold">Unified Asset & Resource Management.</h1>
              <p class="text-white-50 fs-5">Enterprise-grade visibility into your physical and digital operational infrastructure. Optimized for global teams.</p>
            </div>
          </div>

          <div class="position-relative z-3 d-flex align-items-center gap-4 text-white-50 small">
            <div class="d-flex align-items-center gap-2">
              <span class="material-symbols-outlined fs-6">shield</span>
              <span>ISO 27001 Certified</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="material-symbols-outlined fs-6">cloud</span>
              <span>Tier 4 Infrastructure</span>
            </div>
          </div>
        </section>

        <!-- Right Side: Login / Register Area (40% / Full Mobile) -->
        <main class="col-lg-5 bg-light d-flex align-items-center justify-content-center p-4 p-md-5 position-relative">
          <div class="w-100" style="max-width: 440px; z-index: 20;">
            <div class="bg-white border rounded-4 shadow-sm overflow-hidden border-light-subtle">
              <!-- Sign In Form Container -->
              <div class="p-4 p-md-5" id="form-container-login">
                <div class="d-lg-none d-flex align-items-center gap-2 mb-4">
                  <div class="bg-primary rounded d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                    <span class="fw-bold text-white small headline-font">AF</span>
                  </div>
                  <h2 class="h5 text-primary m-0 headline-font">AssetFlow</h2>
                </div>

                <div class="mb-4">
                  <h1 class="h3 text-dark mb-1 headline-font">Sign in to Console</h1>
                  <p class="text-muted small">Enter your workspace credentials to continue.</p>
                </div>

                <div id="login-alert-placeholder"></div>

                <form id="form-login" class="needs-validation" novalidate>
                  <div class="mb-3">
                    <label class="form-label text-uppercase text-muted fw-bold" style="font-size: 11px; letter-spacing: 0.05em;" for="login-email">Work Email</label>
                    <input type="email" class="form-control py-2 border-light-subtle" id="login-email" placeholder="name@company.com" required>
                  </div>
                  <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <label class="form-label text-uppercase text-muted fw-bold mb-0" style="font-size: 11px; letter-spacing: 0.05em;" for="login-password">Password</label>
                      <a class="small text-decoration-none text-primary fw-semibold" style="font-size: 12px;" href="#" id="link-forgot-pass">Forgot?</a>
                    </div>
                    <input type="password" class="form-control py-2 border-light-subtle" id="login-password" placeholder="••••••••" required>
                  </div>
                  <button class="btn btn-primary w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2" type="submit" id="btn-login-submit">
                    <span>Sign In</span>
                  </button>

                  <div class="relative d-flex align-items-center my-3 py-1">
                    <div class="flex-grow-1 border-top border-light-subtle"></div>
                    <span class="mx-3 text-uppercase text-muted small" style="font-size: 9px; letter-spacing: 0.1em;">or use</span>
                    <div class="flex-grow-1 border-top border-light-subtle"></div>
                  </div>

                  <button class="btn btn-outline-secondary border-light-subtle w-100 py-2 d-flex align-items-center justify-content-center gap-2 text-dark hover-light bg-white" type="button" id="btn-sso-login">
                    <svg class="me-1" style="width: 18px; height: 18px;" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
                    </svg>
                    <span>Single Sign-On (SSO)</span>
                  </button>
                </form>

                <div class="pt-4 mt-4 border-top border-light-subtle d-flex align-items-center justify-content-between">
                  <span class="text-muted small">New employee?</span>
                  <button class="btn btn-link text-primary fw-semibold p-0 text-decoration-none small" id="btn-toggle-signup">Request Account</button>
                </div>
              </div>

              <!-- Sign Up Form Container (Hidden initially) -->
              <div class="p-4 p-md-5 d-none" id="form-container-signup">
                <div class="mb-4">
                  <h1 class="h3 text-dark mb-1 headline-font">Request Console Access</h1>
                  <p class="text-muted small">Fill in details to register as an Employee.</p>
                </div>

                <div id="signup-alert-placeholder"></div>

                <form id="form-signup" class="needs-validation" novalidate>
                  <div class="mb-3">
                    <label class="form-label text-uppercase text-muted fw-bold" style="font-size: 11px; letter-spacing: 0.05em;" for="signup-name">Full Name</label>
                    <input type="text" class="form-control py-2 border-light-subtle" id="signup-name" placeholder="John Doe" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-uppercase text-muted fw-bold" style="font-size: 11px; letter-spacing: 0.05em;" for="signup-email">Work Email</label>
                    <input type="email" class="form-control py-2 border-light-subtle" id="signup-email" placeholder="name@company.com" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-uppercase text-muted fw-bold" style="font-size: 11px; letter-spacing: 0.05em;" for="signup-password">Password</label>
                    <input type="password" class="form-control py-2 border-light-subtle" id="signup-password" placeholder="Min. 6 characters" required>
                  </div>
                  <div class="mb-4">
                    <label class="form-label text-uppercase text-muted fw-bold" style="font-size: 11px; letter-spacing: 0.05em;" for="signup-department">Department</label>
                    <select class="form-select py-2 border-light-subtle" id="signup-department" required>
                      <option value="" disabled selected>Select Department</option>
                      <option value="1">Administration</option>
                      <option value="2">Information Technology</option>
                      <option value="3">Facilities & Operations</option>
                      <option value="4">Human Resources</option>
                    </select>
                  </div>
                  <button class="btn btn-secondary bg-secondary w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2" type="submit" id="btn-signup-submit">
                    <span>Submit Request</span>
                  </button>
                </form>

                <div class="pt-4 mt-4 border-top border-light-subtle d-flex align-items-center justify-content-between">
                  <span class="text-muted small">Already have an account?</span>
                  <button class="btn btn-link text-primary fw-semibold p-0 text-decoration-none small" id="btn-toggle-login">Sign In</button>
                </div>
              </div>

              <!-- System Status Footer -->
              <div class="px-4 py-3 bg-light border-top d-flex justify-content-between align-items-center text-muted fw-semibold uppercase" style="font-size: 10px; letter-spacing: 0.08em;">
                <div class="d-flex align-items-center gap-1.5">
                  <span class="d-inline-block rounded-circle bg-success" style="width: 6px; height: 6px;"></span>
                  <span>Systems Operational</span>
                </div>
                <span class="text-muted-50">v4.2.0-stable</span>
              </div>
            </div>

            <!-- Global Footer -->
            <div class="mt-4 text-center text-lg-start opacity-50">
              <p class="small mb-1">&copy; 2026 AssetFlow ERP. All rights reserved.</p>
              <div class="d-flex gap-3 justify-content-center justify-content-lg-start" style="font-size: 11px;">
                <a href="#" class="text-decoration-none text-dark hover-primary">Privacy</a>
                <a href="#" class="text-decoration-none text-dark hover-primary">Terms</a>
                <a href="#" class="text-decoration-none text-dark hover-primary">Security</a>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  },

  onMount(router) {
    const loginFormContainer = document.getElementById('form-container-login');
    const signupFormContainer = document.getElementById('form-container-signup');
    const btnToggleSignup = document.getElementById('btn-toggle-signup');
    const btnToggleLogin = document.getElementById('btn-toggle-login');

    // Toggle panels
    if (btnToggleSignup) {
      btnToggleSignup.addEventListener('click', () => {
        loginFormContainer.classList.add('d-none');
        signupFormContainer.classList.remove('d-none');
      });
    }

    if (btnToggleLogin) {
      btnToggleLogin.addEventListener('click', () => {
        signupFormContainer.classList.add('d-none');
        loginFormContainer.classList.remove('d-none');
      });
    }

    // Bind Forms
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertPlaceholder = document.getElementById('login-alert-placeholder');
        alertPlaceholder.innerHTML = ''; // reset alert

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          const data = await res.json();
          if (res.ok) {
            // Save user details to localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            router.navigateTo('/dashboard');
          } else {
            alertPlaceholder.innerHTML = `
              <div class="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
                <span class="material-symbols-outlined fs-5">error</span>
                <span class="small">${data.error ? data.error.message : 'Invalid credentials'}</span>
              </div>
            `;
          }
        } catch (err) {
          console.error('Login error', err);
          alertPlaceholder.innerHTML = `
            <div class="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
              <span class="material-symbols-outlined fs-5">error</span>
              <span class="small">Connection failure. Please try again.</span>
            </div>
          `;
        }
      });
    }

    const formSignup = document.getElementById('form-signup');
    if (formSignup) {
      formSignup.addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertPlaceholder = document.getElementById('signup-alert-placeholder');
        alertPlaceholder.innerHTML = '';

        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const departmentId = document.getElementById('signup-department').value;

        try {
          const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, departmentId: parseInt(departmentId, 10) })
          });

          const data = await res.json();
          if (res.ok) {
            // Save user details to localStorage and redirect
            localStorage.setItem('user', JSON.stringify(data.user));
            alert('Signup successful! Auto-logging in.');
            router.navigateTo('/dashboard');
          } else {
            // Parse specific details object
            let errorText = data.error ? data.error.message : 'Signup failed';
            if (data.error && data.error.details) {
              const detailFields = Object.keys(data.error.details);
              errorText = detailFields.map(f => `${f}: ${data.error.details[f]}`).join(', ');
            }

            alertPlaceholder.innerHTML = `
              <div class="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
                <span class="material-symbols-outlined fs-5">error</span>
                <span class="small">${errorText}</span>
              </div>
            `;
          }
        } catch (err) {
          console.error('Signup error', err);
          alertPlaceholder.innerHTML = `
            <div class="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
              <span class="material-symbols-outlined fs-5">error</span>
              <span class="small">Connection failure. Please try again.</span>
            </div>
          `;
        }
      });
    }

    // Stub Forgot Password clicks
    const linkForgotPass = document.getElementById('link-forgot-pass');
    if (linkForgotPass) {
      linkForgotPass.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Reset password service stub: Please contact your IT Department head.');
      });
    }

    // Stub SSO Login clicks
    const btnSsoLogin = document.getElementById('btn-sso-login');
    if (btnSsoLogin) {
      btnSsoLogin.addEventListener('click', () => {
        alert('SSO login stub: SAML credentials federations not configured.');
      });
    }
  }
};
