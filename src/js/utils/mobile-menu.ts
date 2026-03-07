/**
 * @file mobile-menu.ts
 * @description Mobile menu toggle and overlay management
 * @version 1.0.0
 *
 * === FEATURES ===
 * - Mobile menu open/close toggle
 * - Overlay click to close
 * - Navigation link click to close
 * - Body scroll lock when menu is open
 * - Smooth transitions with CSS classes
 *
 * === HTML STRUCTURE ===
 * ```html
 * <!-- Menu trigger button (hidden on desktop) -->
 * <button class="lg:hidden" id="mobile-menu-btn">☰</button>
 *
 * <!-- Mobile menu overlay -->
 * <div id="mobile-menu-overlay" class="mobile-menu-overlay">
 *   <div class="mobile-menu-content">
 *     <button id="mobile-menu-close">✕</button>
 *     <nav>
 *       <a href="#" class="mobile-nav-link">Home</a>
 *       <a href="#" class="mobile-nav-link">About</a>
 *       <a href="#" class="mobile-nav-link">Services</a>
 *     </nav>
 *   </div>
 * </div>
 * ```
 *
 * === CSS INTEGRATION ===
 * ```css
 * .mobile-menu-overlay {
 *   position: fixed;
 *   top: 0;
 *   left: 0;
 *   width: 100%;
 *   height: 100%;
 *   background: rgba(0, 0, 0, 0.5);
 *   z-index: 1000;
 *   display: none;
 * }
 *
 * .mobile-menu-overlay.active {
 *   display: flex;
 * }
 *
 * .mobile-menu-content {
 *   background: white;
 *   width: 80%;
 *   height: 100%;
 *   padding: 20px;
 *   overflow-y: auto;
 * }
 * ```
 *
 * === TYPESCRIPT USAGE ===
 * ```typescript
 * import { initMobileMenu } from '@js/utils/mobile-menu';
 *
 * // Initialize mobile menu when DOM is ready
 * initMobileMenu();
 * ```
 *
 * === INITIALIZATION ===
 * Called from src/js/main.ts during DOMContentLoaded event
 */

/**
 * Initialize mobile menu functionality
 *
 * Sets up event listeners for opening/closing mobile menu overlay.
 * Manages body scroll lock and handles clicks on overlay and navigation links.
 *
 * @function initMobileMenu
 * @returns {void}
 *
 * @example
 * // Initialize mobile menu when page loads
 * import { initMobileMenu } from '@js/utils/mobile-menu';
 * document.addEventListener('DOMContentLoaded', () => {
 *   initMobileMenu();
 * });
 *
 * @example
 * // Menu behavior:
 * // - Click menu button → overlay shows, body scroll locked
 * // - Click close button → overlay hides, scroll restored
 * // - Click nav link → overlay hides, scroll restored
 * // - Click outside content (on overlay) → overlay hides, scroll restored
 */
export const initMobileMenu = (): void => {
  // Find mobile menu elements
  const menuBtn = document.getElementById("mobile-menu-btn");
  const overlay = document.getElementById("mobile-menu-overlay");
  const closeBtn = document.getElementById("mobile-menu-close");

  // Early return if elements not found
  if (!overlay) return;

  /**
   * Open mobile menu
   * Shows overlay and prevents body scrolling
   * @function openMenu
   * @returns {void}
   */
  const openMenu = (): void => {
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  /**
   * Close mobile menu
   * Hides overlay and restores body scrolling
   * @function closeMenu
   * @returns {void}
   */
  const closeMenu = (): void => {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  };

  // Open menu on button click
  menuBtn?.addEventListener("click", openMenu);

  // Close menu on close button click
  closeBtn?.addEventListener("click", closeMenu);

  /**
   * Close menu when navigation link is clicked
   * Allows users to navigate while closing menu automatically
   */
  overlay.querySelectorAll(".mobile-nav-link").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  /**
   * Close menu when clicking overlay background (outside content)
   * Only closes if clicked on overlay element itself, not on content children
   */
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeMenu();
    }
  });
};
