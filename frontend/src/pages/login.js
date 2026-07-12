import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';

export const LoginPage = {
  render() {
    const contentHTML = `
      <div class="row min-vh-100 g-0">
        
        <!-- Left Side: Brand Panel (60%) - Premium Hero & Illustration -->
        <section class="col-lg-7 bg-primary position-relative overflow-hidden d-none d-lg-flex flex-column p-5 justify-content-between border-end border-white border-opacity-10" style="background: linear-gradient(135deg, #001229 0%, #002046 100%);">
          <!-- Subtle Glow effect -->
          <div class="position-absolute rounded-circle" style="width: 300px; height: 300px; background: radial-gradient(circle, rgba(184,115,51,0.15) 0%, rgba(0,0,0,0) 70%); top: -10%; left: -10%; filter: blur(50px);"></div>
          <div class="position-absolute rounded-circle" style="width: 400px; height: 400px; background: radial-gradient(circle, rgba(13,110,253,0.1) 0%, rgba(0,0,0,0) 70%); bottom: -10%; right: -10%; filter: blur(60px);"></div>
          
          <div class="position-relative z-3">
            <!-- Brand Logo -->
            <div class="d-flex align-items-center gap-2.5 mb-5">
              <div class="rounded-3 d-flex align-items-center justify-content-center bg-white bg-opacity-10 border border-white border-opacity-20" style="width: 36px; height: 36px;">
                <span class="fw-bold text-white fs-5 headline-font">AF</span>
              </div>
              <h2 class="h4 text-white m-0 tracking-tight headline-font fw-bold">AssetFlow</h2>
            </div>

            <!-- Redesigned Hero Title -->
            <div class="mb-5">
              <h1 class="display-5 text-white mb-3 lh-sm headline-font fw-bold" style="letter-spacing: -0.02em;">
                Manage Every Asset.<br>One Intelligent Platform.
              </h1>
              <p class="text-white-50 fs-6" style="max-width: 460px; line-height: 1.6;">
                Enterprise-grade visibility into physical, digital, and operational infrastructure. Streamline handovers, scheduling, and repairs instantly.
              </p>
            </div>

            <!-- Redesigned Feature Lists -->
            <div class="row g-3 mt-4" style="max-width: 580px;">
              <div class="col-md-6">
                <div class="d-flex align-items-start gap-2.5">
                  <span class="material-symbols-outlined text-warning fs-5">explore</span>
                  <div>
                    <h6 class="text-white fw-bold mb-0" style="font-size: 13.5px;">Real-Time Tracking</h6>
                    <small class="text-white-50" style="font-size: 11.5px;">Accurate custody verification and lifecycle logs.</small>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-flex align-items-start gap-2.5">
                  <span class="material-symbols-outlined text-warning fs-5">event_available</span>
                  <div>
                    <h6 class="text-white fw-bold mb-0" style="font-size: 13.5px;">Resource Booking</h6>
                    <small class="text-white-50" style="font-size: 11.5px;">Automated reservations schedules for shared pools.</small>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Live Statistics Cards -->
          <div class="position-relative z-3 row g-2 mt-4" style="max-width: 540px;">
            <div class="col-6 col-sm-3">
              <div class="border border-white border-opacity-10 rounded-3 p-2.5 text-white" style="background: rgba(255, 255, 255, 0.08);">
                <small class="text-white-50 d-block mb-1" style="font-size: 9px; letter-spacing: 0.05em; font-weight: bold;">ASSETS MANAGED</small>
                <strong class="text-white fs-5">1,280+</strong>
              </div>
            </div>
            <div class="col-6 col-sm-3">
              <div class="border border-white border-opacity-10 rounded-3 p-2.5 text-white" style="background: rgba(255, 255, 255, 0.08);">
                <small class="text-white-50 d-block mb-1" style="font-size: 9px; letter-spacing: 0.05em; font-weight: bold;">DEPARTMENTS</small>
                <strong class="text-white fs-5">12</strong>
              </div>
            </div>
            <div class="col-6 col-sm-3">
              <div class="border border-white border-opacity-10 rounded-3 p-2.5 text-white" style="background: rgba(255, 255, 255, 0.08);">
                <small class="text-white-50 d-block mb-1" style="font-size: 9px; letter-spacing: 0.05em; font-weight: bold;">ACTIVE USERS</small>
                <strong class="text-white fs-5">450+</strong>
              </div>
            </div>
            <div class="col-6 col-sm-3">
              <div class="border border-white border-opacity-10 rounded-3 p-2.5 text-white" style="background: rgba(255, 255, 255, 0.08);">
                <small class="text-white-50 d-block mb-1" style="font-size: 9px; letter-spacing: 0.05em; font-weight: bold;">OPERATIONAL</small>
                <strong class="text-white fs-5">99.9%</strong>
              </div>
            </div>
          </div>
        </section>

        <!-- Right Side: Login / Register Area (40% / Full Mobile) -->
        <main class="col-lg-5 bg-light d-flex align-items-center justify-content-center p-4 p-md-5 position-relative">
          <div class="w-100" style="max-width: 420px; z-index: 20;">
            <div class="bg-white border rounded-3 shadow-sm overflow-hidden border-light-subtle">
              
              <!-- Sign In Form Container -->
              <div class="p-4 p-md-4.5" id="form-container-login">
                <div class="d-lg-none d-flex align-items-center gap-2 mb-4">
                  <div class="bg-primary rounded d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                    <span class="fw-bold text-white small headline-font">AF</span>
                  </div>
                  <h2 class="h5 text-primary m-0 headline-font fw-bold">AssetFlow</h2>
                </div>

                <div class="mb-4 text-center text-lg-start">
                  <h1 class="h3 text-dark mb-1 fw-bold headline-font">Welcome Back</h1>
                  <p class="text-muted small">Enter your workspace credentials to continue.</p>
                </div>

                <div id="login-alert-placeholder"></div>

                <form id="form-login" class="needs-validation" novalidate>
                  <div class="mb-3">
                    <label class="form-label text-uppercase text-muted fw-bold mb-1.5" style="font-size: 10px; letter-spacing: 0.05em;" for="login-email">Work Email</label>
                    <input type="email" class="form-control py-2.5 border-light-subtle rounded-2" id="login-email" placeholder="name@company.com" required>
                  </div>
                  
                  <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-1.5">
                      <label class="form-label text-uppercase text-muted fw-bold mb-0" style="font-size: 10px; letter-spacing: 0.05em;" for="login-password">Password</label>
                      <a class="small text-decoration-none text-primary fw-bold" style="font-size: 11.5px;" href="#" id="link-forgot-pass">Forgot Password?</a>
                    </div>
                    <div class="position-relative">
                      <input type="password" class="form-control py-2.5 border-light-subtle rounded-2 pe-5" id="login-password" placeholder="••••••••" required>
                      <button type="button" class="btn position-absolute top-50 end-0 translate-middle-y me-1 border-0 bg-transparent text-muted p-1" id="btn-toggle-password-visibility" tabindex="-1">
                        <span class="material-symbols-outlined fs-5 align-middle" id="pwd-toggle-icon">visibility</span>
                      </button>
                    </div>
                  </div>

                  <button class="btn btn-primary w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-2" type="submit" id="btn-login-submit">
                    <span id="btn-login-text">Sign In</span>
                  </button>
                </form>

                <div class="pt-3.5 mt-4 border-top border-light-subtle d-flex align-items-center justify-content-between mb-3" style="font-size: 13.5px;">
                  <span class="text-muted">New employee?</span>
                  <button class="btn btn-link text-primary fw-bold p-0 text-decoration-none" id="btn-toggle-signup">Request Account</button>
                </div>
              </div>

              <!-- Sign Up Form Container (Hidden initially) -->
              <div class="p-4 p-md-4.5 d-none" id="form-container-signup">
                <div class="mb-4 text-center text-lg-start">
                  <h1 class="h3 text-dark mb-1 fw-bold headline-font">Request Access</h1>
                  <p class="text-muted small">Register your workspace profile as an Employee.</p>
                </div>

                <div id="signup-alert-placeholder"></div>

                <form id="form-signup" class="needs-validation" novalidate>
                  <div class="mb-3">
                    <label class="form-label text-uppercase text-muted fw-bold mb-1.5" style="font-size: 10px; letter-spacing: 0.05em;" for="signup-name">Full Name</label>
                    <input type="text" class="form-control py-2.5 border-light-subtle rounded-2" id="signup-name" placeholder="John Doe" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-uppercase text-muted fw-bold mb-1.5" style="font-size: 10px; letter-spacing: 0.05em;" for="signup-email">Work Email</label>
                    <input type="email" class="form-control py-2.5 border-light-subtle rounded-2" id="signup-email" placeholder="name@company.com" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-uppercase text-muted fw-bold mb-1.5" style="font-size: 10px; letter-spacing: 0.05em;" for="signup-password">Password</label>
                    <input type="password" class="form-control py-2.5 border-light-subtle rounded-2" id="signup-password" placeholder="Min. 6 characters" required>
                  </div>
                  <div class="mb-4">
                    <label class="form-label text-uppercase text-muted fw-bold mb-1.5" style="font-size: 10px; letter-spacing: 0.05em;" for="signup-department">Department</label>
                    <select class="form-select py-2.5 border-light-subtle rounded-2" id="signup-department" required>
                      <option value="" disabled selected>Select Department</option>
                      <option value="1">Administration</option>
                      <option value="2">Information Technology</option>
                      <option value="3">Facilities & Operations</option>
                      <option value="4">Human Resources</option>
                    </select>
                  </div>
                  <button class="btn btn-primary w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-2" type="submit" id="btn-signup-submit">
                    <span id="btn-signup-text">Submit Request</span>
                  </button>
                </form>

                <div class="pt-3.5 mt-4 border-top border-light-subtle d-flex align-items-center justify-content-between" style="font-size: 13.5px;">
                  <span class="text-muted">Already have an account?</span>
                  <button class="btn btn-link text-primary fw-bold p-0 text-decoration-none" id="btn-toggle-login">Sign In</button>
                </div>
              </div>

            </div>

            <!-- Redesigned Footer -->
            <div class="mt-4 text-center opacity-75">
              <p class="small text-muted mb-1">&copy; 2026 AssetFlow Enterprise ERP.</p>
              <div class="d-flex gap-2 justify-content-center text-muted" style="font-size: 11px;">
                <span>ISO 27001 Secured</span> &middot;
                <span>Tier-IV Infrastructure</span>
              </div>
            </div>

          </div>
        </main>
      </div>
    `;

    return contentHTML;
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

    // Password Visibility Toggle
    const btnTogglePassword = document.getElementById('btn-toggle-password-visibility');
    const passwordInput = document.getElementById('login-password');
    const toggleIcon = document.getElementById('pwd-toggle-icon');

    if (btnTogglePassword && passwordInput && toggleIcon) {
      btnTogglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        toggleIcon.innerText = type === 'password' ? 'visibility' : 'visibility_off';
      });
    }

    // Autofill Credentials Action
    document.querySelectorAll('.btn-autofill').forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.getAttribute('data-email');
        const password = btn.getAttribute('data-password');
        
        const emailInput = document.getElementById('login-email');
        const passInput = document.getElementById('login-password');

        if (emailInput && passInput) {
          emailInput.value = email;
          passInput.value = password;
          
          // Trigger CSS focus visual check
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));
          passInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    });

    // Bind Forms
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertPlaceholder = document.getElementById('login-alert-placeholder');
        const submitBtn = document.getElementById('btn-login-submit');
        const submitText = document.getElementById('btn-login-text');
        
        alertPlaceholder.innerHTML = ''; // reset alert

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Set Loading state
        if (submitBtn && submitText) {
          submitBtn.disabled = true;
          submitText.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Signing in...`;
        }

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
            // Reset Loading state
            if (submitBtn && submitText) {
              submitBtn.disabled = false;
              submitText.innerText = 'Sign In';
            }
          }
        } catch (err) {
          console.error('Login error', err);
          alertPlaceholder.innerHTML = `
            <div class="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
              <span class="material-symbols-outlined fs-5">error</span>
              <span class="small">Connection failure. Please try again.</span>
            </div>
          `;
          // Reset Loading state
          if (submitBtn && submitText) {
            submitBtn.disabled = false;
            submitText.innerText = 'Sign In';
          }
        }
      });
    }

    const formSignup = document.getElementById('form-signup');
    if (formSignup) {
      formSignup.addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertPlaceholder = document.getElementById('signup-alert-placeholder');
        const submitBtn = document.getElementById('btn-signup-submit');
        const submitText = document.getElementById('btn-signup-text');
        
        alertPlaceholder.innerHTML = '';

        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const departmentId = document.getElementById('signup-department').value;

        // Set Loading state
        if (submitBtn && submitText) {
          submitBtn.disabled = true;
          submitText.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...`;
        }

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
            // Reset Loading state
            if (submitBtn && submitText) {
              submitBtn.disabled = false;
              submitText.innerText = 'Submit Request';
            }
          }
        } catch (err) {
          console.error('Signup error', err);
          alertPlaceholder.innerHTML = `
            <div class="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
              <span class="material-symbols-outlined fs-5">error</span>
              <span class="small">Connection failure. Please try again.</span>
            </div>
          `;
          // Reset Loading state
          if (submitBtn && submitText) {
            submitBtn.disabled = false;
            submitText.innerText = 'Submit Request';
          }
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
  }
};
