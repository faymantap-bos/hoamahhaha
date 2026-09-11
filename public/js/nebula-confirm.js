(function () {
  "use strict";

  let activeClose = null;

  window.nebulaConfirm = function nebulaConfirm(options = {}) {
    if (activeClose) activeClose(false, true);

    const {
      eyebrow = "Konfirmasi",
      title = "Hapus email?",
      message = "Email yang telah dihapus tidak dapat dikembalikan.",
      confirmText = "Hapus",
      cancelText = "Batal"
    } = options;

    return new Promise(resolve => {
      const previousFocus = document.activeElement;
      const layer = document.createElement("div");
      const dialog = document.createElement("div");
      const content = document.createElement("div");
      const heading = document.createElement("div");
      const icon = document.createElement("div");
      const headingText = document.createElement("div");
      const eyebrowElement = document.createElement("p");
      const titleElement = document.createElement("h2");
      const messageElement = document.createElement("p");
      const actions = document.createElement("div");
      const cancelButton = document.createElement("button");
      const confirmButton = document.createElement("button");

      const titleId = `nebula-confirm-title-${Date.now()}`;
      const messageId = `nebula-confirm-message-${Date.now()}`;

      layer.className = "nebula-confirm-layer";
      dialog.className = "nebula-confirm-dialog";
      dialog.setAttribute("role", "alertdialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-labelledby", titleId);
      dialog.setAttribute("aria-describedby", messageId);
      dialog.tabIndex = -1;

      content.className = "nebula-confirm-content";
      heading.className = "nebula-confirm-heading";
      icon.className = "nebula-confirm-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = [
        '<svg viewBox="0 0 24 24" aria-hidden="true">',
        '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"></path>',
        '<path d="M12 9v4"></path>',
        '<path d="M12 17h.01"></path>',
        "</svg>"
      ].join("");

      eyebrowElement.className = "nebula-confirm-eyebrow";
      eyebrowElement.textContent = eyebrow;
      titleElement.className = "nebula-confirm-title";
      titleElement.id = titleId;
      titleElement.textContent = title;
      messageElement.className = "nebula-confirm-message";
      messageElement.id = messageId;
      messageElement.textContent = message;

      actions.className = "nebula-confirm-actions";
      cancelButton.className = "nebula-confirm-button";
      cancelButton.type = "button";
      cancelButton.textContent = cancelText;
      confirmButton.className = "nebula-confirm-button nebula-confirm-button--danger";
      confirmButton.type = "button";
      confirmButton.textContent = confirmText;

      headingText.append(eyebrowElement, titleElement);
      heading.append(icon, headingText);
      content.append(heading, messageElement);
      actions.append(cancelButton, confirmButton);
      dialog.append(content, actions);
      layer.append(dialog);
      document.body.append(layer);

      let settled = false;

      function close(result, immediately = false) {
        if (settled) return;
        settled = true;
        activeClose = null;
        document.removeEventListener("keydown", onKeydown);

        const finish = () => {
          layer.remove();
          if (previousFocus && typeof previousFocus.focus === "function") {
            previousFocus.focus();
          }
          resolve(result);
        };

        if (immediately || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          finish();
          return;
        }

        layer.classList.add("is-closing");
        window.setTimeout(finish, 180);
      }

      function onKeydown(event) {
        if (event.key === "Escape") {
          event.preventDefault();
          close(false);
          return;
        }

        if (event.key !== "Tab") return;
        const buttons = [cancelButton, confirmButton];
        const currentIndex = buttons.indexOf(document.activeElement);
        const nextIndex = event.shiftKey
          ? (currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1)
          : (currentIndex === buttons.length - 1 ? 0 : currentIndex + 1);
        event.preventDefault();
        buttons[nextIndex].focus();
      }

      activeClose = close;
      cancelButton.addEventListener("click", () => close(false));
      confirmButton.addEventListener("click", () => close(true));
      layer.addEventListener("click", event => {
        if (event.target === layer) close(false);
      });
      document.addEventListener("keydown", onKeydown);

      window.requestAnimationFrame(() => {
        layer.classList.add("is-open");
        dialog.focus({ preventScroll: true });
      });
    });
  };
})();
