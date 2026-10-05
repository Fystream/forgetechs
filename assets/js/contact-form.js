/* ============================================================================
 *  CONTACT FORM  (contact.html only)
 *  ---------------------------------------------------------------------------
 *  A static site has no server, so there is nothing to POST to. Rather than
 *  fake a form that silently loses messages — the worst possible outcome for a
 *  business site — this composes the enquiry and hands it to WhatsApp or the
 *  visitor's mail client, both of which they already trust and can see.
 *
 *  PROGRESSIVE ENHANCEMENT. The two send actions are real <a> elements with
 *  working hrefs, so with this file absent (or JavaScript off entirely) they
 *  still open WhatsApp and the mail client — just without the typed message.
 *  Everything below is the upgrade, not the mechanism.
 *
 *  If you later host this somewhere with a backend (Netlify Forms, Formspree),
 *  swap the two handlers below for a fetch() and keep the same markup.
 * ========================================================================== */

(function () {
  'use strict';

  var WHATSAPP_NUMBER = '919656916615'; // country code + number, no + or spaces
  var EMAIL = 'forgestechs@gmail.com';

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('enquiry');
    if (!form) return;

    var status = document.getElementById('enquiry-status');

    function collect() {
      var name = (form.elements.name.value || '').trim();
      var business = (form.elements.business.value || '').trim();
      var detail = (form.elements.detail.value || '').trim();

      /* These two lines used to toggle classes from the old dark theme, which
       * no longer exist in the palette — so the error message never actually
       * got its emphasis. Assigning className outright keeps the size utility
       * and the colour in one place and cannot drift apart again. */
      if (!name || !detail) {
        if (status) {
          status.textContent = 'Please add your name and a line about what you need.';
          status.className = 'text-[13px] text-ink';
        }
        return null;
      }

      if (status) {
        status.textContent = 'Opening… if nothing happens, use the direct links above.';
        status.className = 'text-[13px] text-ink-45';
      }

      return {
        name: name,
        business: business,
        detail: detail,
        body:
          'Hello Falah,\n\n' +
          'Name: ' + name + '\n' +
          (business ? 'Business: ' + business + '\n' : '') +
          '\n' + detail + '\n',
      };
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault(); // never let it navigate — there is no endpoint
    });

    /* Both handlers stopPropagation as well as preventDefault. The click-to-copy
     * handler in site.js listens on `document` for any mailto: link, and the
     * page-transition handler listens there for any link at all; stopping the
     * event here keeps them out of a click we have already answered. */
    var waBtn = document.getElementById('send-whatsapp');
    if (waBtn) {
      waBtn.addEventListener('click', function (e) {
        var d = collect();
        /* Nothing typed yet → let the plain href through, which opens WhatsApp
         * with the generic greeting. Half-filled → hold them here with the
         * validation message instead of sending a message missing the detail. */
        if (!d) { e.preventDefault(); e.stopPropagation(); return; }
        e.preventDefault();
        e.stopPropagation();
        window.open(
          'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(d.body),
          '_blank',
          'noopener'
        );
      });
    }

    var mailBtn = document.getElementById('send-email');
    if (mailBtn) {
      mailBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var d = collect();
        if (!d) return;
        var subject = 'Website enquiry' + (d.business ? ' — ' + d.business : '');
        window.location.href =
          'mailto:' + EMAIL +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(d.body);
      });
    }
  });
})();
