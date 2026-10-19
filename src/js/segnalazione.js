// Modulo di segnalazione: genera il PDF del modulo PQ 07 Mod. 03 con le
// risposte del form e lo invia a Netlify Forms insieme ai campi.
// L'intestazione (loghi, revisione, ragione sociale) è copiata dal PDF
// ufficiale; tabelle e campi sono disegnati qui con altezze adattate al testo.
(function () {
    "use strict";

    var MODULO_URL = "/public/certificazioni/modulo-segnalazione.pdf";
    var PAGINA_OK = "/segnalazione-inviata.html";
    // Netlify accetta richieste fino a 8 MB in totale: margine per gli altri campi
    var MAX_FILE = 7 * 1024 * 1024;

    var PAGE_W = 595.32;
    var PAGE_H = 842.04;
    var X0 = 60;
    var X1 = 540;
    var LABEL_W = 130;
    var PAD = 6;
    var MARGINE_BASSO = 50;
    var TESTO = 10;
    var ETICHETTA = 9;
    // Ritaglio dell'intestazione dalla pagina 1 del modulo ufficiale
    var HEADER = { left: 28, bottom: PAGE_H - 131, right: 576, top: PAGE_H - 33 };
    var INIZIO_CONTENUTO = PAGE_H - 150;
    var NERO = null;
    var GRIGIO = null;

    var TIPI = ["Conflitto intrapersonale", "Molestia", "Abuso"];

    var CLASSIFICAZIONI = [
        "Commenti sessualmente espliciti o offensivi",
        "Avances o richieste sessuali non desiderate",
        "Toccamenti o contatto fisico non consenziente",
        "Mostrare immagini o materiali sessualmente espliciti",
        "Minacce o ricatti sessuali",
        "Bullismo o comportamenti intimidatori basati sul genere",
        "Espressioni di bias o stereotipi di genere",
        "Mancanza di rispetto per i confini personali",
        "Ignorare o minimizzare le denunce di molestie e molestie sessuali",
        "Sfruttamento professionale o economico basato sul genere",
        "Molestie sessuali online o tramite mezzi digitali",
        "Discriminazione nell'assegnazione delle mansioni o nella valutazione delle prestazioni basate sul genere"
    ];

    var CIRCOSTANZE = [
        ["chi", "1. Chi"],
        ["cosa", "2. Cosa"],
        ["come", "3. Come"],
        ["quando", "4. Quando"],
        ["dove", "5. Dove"],
        ["alla_presenza_di", "6. Alla presenza di chi"]
    ];

    var CAMPI_TESTO = ["data_rilevazione", "classificazione_altro", "persone_indagate", "persone_offese",
        "chi", "cosa", "come", "quando", "dove", "alla_presenza_di", "persone_informate", "recapito"];

    function due(n) {
        return (n < 10 ? "0" : "") + n;
    }

    function formattaData(iso) {
        var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
        return m ? m[3] + "/" + m[2] + "/" + m[1] : (iso || "");
    }

    function formattaDataOra(d) {
        return due(d.getDate()) + "/" + due(d.getMonth() + 1) + "/" + d.getFullYear() +
            " alle " + due(d.getHours()) + ":" + due(d.getMinutes());
    }

    // Helvetica standard copre solo WinAnsi: sostituisce i caratteri non stampabili
    function pulisci(font, testo) {
        var out = "";
        var norm = String(testo || "").normalize("NFC").replace(/\r\n?/g, "\n").replace(/\t/g, " ");
        for (var i = 0; i < norm.length; i++) {
            var ch = norm[i];
            if (ch === "\n") { out += ch; continue; }
            try {
                font.widthOfTextAtSize(ch, TESTO);
                out += ch;
            } catch (e) {
                out += "?";
            }
        }
        return out.trim();
    }

    // Divide il testo in righe larghe al massimo "max" punti
    function aCapo(font, size, testo, max) {
        var righe = [];
        String(testo).split("\n").forEach(function (par) {
            var riga = "";
            par.split(/\s+/).filter(Boolean).forEach(function (parola) {
                var prova = riga ? riga + " " + parola : parola;
                if (font.widthOfTextAtSize(prova, size) <= max) {
                    riga = prova;
                    return;
                }
                if (riga) righe.push(riga);
                // parola più lunga della riga: spezzata a forza
                while (font.widthOfTextAtSize(parola, size) > max) {
                    var n = parola.length;
                    while (n > 1 && font.widthOfTextAtSize(parola.slice(0, n), size) > max) n--;
                    righe.push(parola.slice(0, n));
                    parola = parola.slice(n);
                }
                riga = parola;
            });
            righe.push(riga);
        });
        return righe;
    }

    function altezzaRiga(size) {
        return size + 3.5;
    }

    // --- Impaginazione ---------------------------------------------------

    function nuovaPagina(ctx) {
        ctx.page = ctx.pdf.addPage([PAGE_W, PAGE_H]);
        ctx.page.drawPage(ctx.header, { x: HEADER.left, y: HEADER.bottom });
        ctx.y = INIZIO_CONTENUTO;
    }

    function spazio(ctx, h) {
        if (ctx.y - h < MARGINE_BASSO) nuovaPagina(ctx);
    }

    function testo(ctx, str, x, y, size, font) {
        ctx.page.drawText(str, { x: x, y: y, size: size, font: font, color: NERO });
    }

    function bordo(ctx, x, yTop, w, h, sfondo) {
        ctx.page.drawRectangle({
            x: x, y: yTop - h, width: w, height: h,
            borderColor: NERO, borderWidth: 0.6, color: sfondo || undefined
        });
    }

    function casella(ctx, x, baseline, spuntata) {
        var lato = 7.5;
        ctx.page.drawRectangle({ x: x, y: baseline - 1, width: lato, height: lato, borderColor: NERO, borderWidth: 0.6 });
        if (spuntata) testo(ctx, "X", x + 1.3, baseline, 8, ctx.bold);
    }

    // Trasforma i blocchi di una cella in righe già misurate
    function righeDaBlocchi(ctx, blocchi, larghezza) {
        var righe = [];
        blocchi.forEach(function (b) {
            var font = b.bold ? ctx.bold : ctx.font;
            var size = b.size || TESTO;
            var rientro = (b.rientro || 0) + (b.casella !== undefined ? 13 : 0);
            aCapo(font, size, b.testo, larghezza - rientro).forEach(function (r, i) {
                righe.push({
                    testo: r, font: font, size: size, rientro: rientro,
                    casella: i === 0 ? b.casella : undefined,
                    // un titoletto non resta in fondo alla pagina senza il suo testo
                    tieni: !!b.bold,
                    h: altezzaRiga(size) + (i === 0 && b.spazioSopra ? b.spazioSopra : 0)
                });
            });
        });
        return righe;
    }

    // Riga di tabella "etichetta | contenuto"; se è lunga continua alla pagina dopo
    function rigaTabella(ctx, etichetta, blocchi, opzioni) {
        var o = opzioni || {};
        var xValore = X0 + LABEL_W;
        var larghezzaValore = X1 - xValore - 2 * PAD;
        var righe = righeDaBlocchi(ctx, blocchi, larghezzaValore);
        var righeEtichetta = aCapo(ctx.font, ETICHETTA, etichetta, LABEL_W - 2 * PAD);
        var hEtichetta = righeEtichetta.length * altezzaRiga(ETICHETTA) + 2 * PAD;
        var primo = true;
        var hTotale = righe.reduce(function (acc, r) { return acc + r.h; }, 0) + 2 * PAD;
        // la tabella si spezza solo se non entra neanche in una pagina vuota
        if (hTotale > ctx.y - MARGINE_BASSO && hTotale <= INIZIO_CONTENUTO - MARGINE_BASSO) nuovaPagina(ctx);

        while (primo || righe.length) {
            var disponibile = ctx.y - MARGINE_BASSO - 2 * PAD;
            var n = 0, hContenuto = 0;
            while (n < righe.length && hContenuto + righe[n].h <= disponibile) {
                hContenuto += righe[n].h;
                n++;
            }
            if (n < righe.length) {
                while (n > 1 && righe[n - 1].tieni) n--;
            }
            var hMin = Math.max(primo ? hEtichetta : 0, o.altezzaMinima || 0);
            if ((n === 0 && righe.length) || (primo && hMin > disponibile + 2 * PAD)) {
                nuovaPagina(ctx);
                continue;
            }
            var h = Math.max(hContenuto + 2 * PAD, hMin);
            var top = ctx.y;
            bordo(ctx, X0, top, X1 - X0, h);
            ctx.page.drawLine({ start: { x: xValore, y: top }, end: { x: xValore, y: top - h }, thickness: 0.6, color: NERO });

            var etich = primo ? righeEtichetta : righeEtichetta.concat(["(segue)"]);
            var yE = top - PAD - ETICHETTA;
            etich.forEach(function (r) {
                var w = ctx.font.widthOfTextAtSize(r, ETICHETTA);
                testo(ctx, r, xValore - PAD - w, yE, ETICHETTA, ctx.font);
                yE -= altezzaRiga(ETICHETTA);
            });

            var y = top - PAD;
            righe.slice(0, n).forEach(function (r) {
                y -= r.h;
                var base = y + 3;
                var x = xValore + PAD + r.rientro;
                if (r.casella !== undefined) casella(ctx, x - 13, base, r.casella);
                testo(ctx, r.testo, x, base, r.size, r.font);
            });

            ctx.y = top - h;
            righe = righe.slice(n);
            primo = false;
        }
    }

    function intestazioneSezione(ctx, titolo) {
        var h = 20;
        spazio(ctx, h + 60);
        bordo(ctx, X0, ctx.y, X1 - X0, h, GRIGIO);
        var w = ctx.bold.widthOfTextAtSize(titolo, 10);
        testo(ctx, titolo, (X0 + X1 - w) / 2, ctx.y - 13.5, 10, ctx.bold);
        ctx.y -= h;
    }

    function tabellaTipo(ctx, tipo) {
        var h = 22, xa = 160, xb = 205, xc = 440;
        spazio(ctx, h * 3);
        TIPI.forEach(function (t) {
            bordo(ctx, xa, ctx.y, xc - xa, h);
            ctx.page.drawLine({ start: { x: xb, y: ctx.y }, end: { x: xb, y: ctx.y - h }, thickness: 0.6, color: NERO });
            if (t === tipo) {
                var wx = ctx.bold.widthOfTextAtSize("X", 14);
                testo(ctx, "X", (xa + xb - wx) / 2, ctx.y - 16, 14, ctx.bold);
            }
            var w = ctx.bold.widthOfTextAtSize(t, 13);
            testo(ctx, t, (xb + xc - w) / 2, ctx.y - 16, 13, ctx.bold);
            ctx.y -= h;
        });
    }

    function numeraPagine(ctx) {
        var pagine = ctx.pdf.getPages();
        pagine.forEach(function (p, i) {
            var s = "Pagina " + (i + 1) + " di " + pagine.length;
            var w = ctx.font.widthOfTextAtSize(s, 8);
            p.drawText(s, { x: (PAGE_W - w) / 2, y: 28, size: 8, font: ctx.font, color: NERO });
        });
    }

    function valore(v) {
        return v ? v : "-";
    }

    // --- Generazione -----------------------------------------------------

    async function creaModuloPdf(dati, bytesModulo) {
        NERO = PDFLib.rgb(0, 0, 0);
        GRIGIO = PDFLib.rgb(0.88, 0.88, 0.88);
        var originale = await PDFLib.PDFDocument.load(bytesModulo);
        var pdf = await PDFLib.PDFDocument.create();
        var ctx = {
            pdf: pdf,
            font: await pdf.embedFont(PDFLib.StandardFonts.Helvetica),
            bold: await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold),
            header: await pdf.embedPage(originale.getPages()[0], HEADER)
        };
        var t = {};
        CAMPI_TESTO.forEach(function (k) { t[k] = pulisci(ctx.font, dati[k]); });
        var scelte = dati.classificazione || [];

        nuovaPagina(ctx);
        testo(ctx, "N° SEGNALAZIONE: ____________", X0, ctx.y, 10, ctx.font);
        var inviata = "Inviata dal sito web il " + formattaDataOra(dati.inviataIl || new Date());
        testo(ctx, inviata, X1 - ctx.font.widthOfTextAtSize(inviata, 8), ctx.y, 8, ctx.font);
        ctx.y -= 30;

        var titolo = "SEGNALAZIONE ANONIMA";
        testo(ctx, titolo, (PAGE_W - ctx.bold.widthOfTextAtSize(titolo, 14)) / 2, ctx.y, 14, ctx.bold);
        ctx.y -= 10;
        tabellaTipo(ctx, dati.tipo);
        ctx.y -= 20;

        rigaTabella(ctx, "DATA DI RILEVAZIONE", [{ testo: valore(formattaData(t.data_rilevazione)) }]);
        rigaTabella(ctx, "MODERATORE ESPERTO DELLA SESSIONE DI LAVORO", [{ testo: "Responsabile sistema di gestione" }]);
        ctx.y -= 20;

        intestazioneSezione(ctx, "APERTURA DELLE INDAGINI");
        var voci = CLASSIFICAZIONI.map(function (c) {
            return { testo: c, casella: scelte.indexOf(c) !== -1 };
        });
        voci.push({ testo: "Altro:" + (t.classificazione_altro ? " " + t.classificazione_altro : ""), casella: !!t.classificazione_altro });
        rigaTabella(ctx, "CLASSIFICAZIONE DELL'EVENTO", voci);
        rigaTabella(ctx, "PERSONE INDAGATE", [{ testo: valore(t.persone_indagate) }], { altezzaMinima: 30 });
        rigaTabella(ctx, "PERSONE OFFESE", [{ testo: valore(t.persone_offese) }], { altezzaMinima: 30 });
        ctx.y -= 20;

        var circostanze = [{ testo: "Descrivere l'evento specificando:" }];
        CIRCOSTANZE.forEach(function (c) {
            circostanze.push({ testo: c[1] + ":", bold: true, spazioSopra: 6 });
            circostanze.push({ testo: valore(t[c[0]]), rientro: 12 });
        });
        rigaTabella(ctx, "CIRCOSTANZE DELL'EVENTO", circostanze);
        rigaTabella(ctx, "PERSONE INFORMATE SUI FATTI", [
            { testo: "Indicare nome e cognome ai fini dell'identificazione e i recapiti ai fini della rintracciabilità", size: 8 },
            { testo: valore(t.persone_informate), spazioSopra: 4 }
        ], { altezzaMinima: 40 });

        if (t.recapito) {
            ctx.y -= 20;
            intestazioneSezione(ctx, "INFORMAZIONI AGGIUNTIVE INVIATE DAL SITO");
            rigaTabella(ctx, "RECAPITO DI CHI SEGNALA", [{ testo: t.recapito }]);
        }

        numeraPagine(ctx);
        pdf.setTitle("Segnalazione abuso o molestia o conflitto intrapersonale");
        pdf.setProducer("nauticavanni.com");
        pdf.setCreator("nauticavanni.com");
        return pdf.save();
    }

    // --- Form ------------------------------------------------------------

    function datiDalForm(form) {
        var fd = new FormData(form);
        var dati = { inviataIl: new Date(), tipo: fd.get("tipo") || "", classificazione: fd.getAll("classificazione") };
        CAMPI_TESTO.forEach(function (k) {
            dati[k] = fd.get(k) || "";
        });
        return dati;
    }

    function nomeFile(d) {
        return "segnalazione-" + d.getFullYear() + due(d.getMonth() + 1) + due(d.getDate()) +
            "-" + due(d.getHours()) + due(d.getMinutes()) + ".pdf";
    }

    // Mostra i campi online oppure il caricamento del modulo scansionato.
    // I fieldset disabilitati non vengono validati né inviati.
    function initModalita(form) {
        var gruppi = form.querySelectorAll("fieldset.modalita");
        var aggiorna = function () {
            var scelta = form.querySelector('input[name="modalita"]:checked');
            var valore = scelta ? scelta.value : "online";
            Array.prototype.forEach.call(gruppi, function (g) {
                var attivo = g.getAttribute("data-modalita") === valore;
                g.disabled = !attivo;
                g.hidden = !attivo;
            });
        };
        Array.prototype.forEach.call(form.querySelectorAll('input[name="modalita"]'), function (r) {
            r.addEventListener("change", aggiorna);
        });
        aggiorna();
    }

    async function allegaModuloGenerato(form, fd) {
        try {
            var dati = datiDalForm(form);
            var modulo = await fetch(MODULO_URL).then(function (r) {
                if (!r.ok) throw new Error("Modulo PDF non disponibile (" + r.status + ")");
                return r.arrayBuffer();
            });
            var bytes = await creaModuloPdf(dati, modulo);
            fd.set("modulo_pdf", new File([bytes], nomeFile(dati.inviataIl), { type: "application/pdf" }));
        } catch (errore) {
            // senza PDF la segnalazione parte comunque con i soli campi
            fd.delete("modulo_pdf");
            fd.set("errore_pdf", String(errore && errore.message || errore));
        }
    }

    function init() {
        var form = document.querySelector('form[name="segnalazione"]');
        if (!form) return;
        initModalita(form);
        // senza fetch/FormData il form viene inviato normalmente, senza PDF generato
        if (!window.fetch || !window.FormData) return;
        var bottone = form.querySelector(".invia");
        var testoBottone = bottone ? bottone.innerHTML : "";
        var ripristina = function () {
            if (bottone) {
                bottone.disabled = false;
                bottone.innerHTML = testoBottone;
            }
        };

        form.addEventListener("submit", async function (evento) {
            evento.preventDefault();
            var scansione = form.querySelector('input[name="modulo_scansionato"]');
            var file = scansione && !scansione.disabled && scansione.files[0];
            if (file && file.size > MAX_FILE) {
                alert("Il file supera 7 MB. Riduci la risoluzione della scansione e riprova.");
                return;
            }
            if (bottone) {
                bottone.disabled = true;
                bottone.textContent = "Invio in corso…";
            }
            var fd = new FormData(form);
            fd.delete("modulo_pdf");
            if (fd.get("modalita") !== "scansione" && window.PDFLib) await allegaModuloGenerato(form, fd);
            try {
                var risposta = await fetch("/", { method: "POST", body: fd });
                if (!risposta.ok) throw new Error("HTTP " + risposta.status);
                window.location.href = PAGINA_OK;
            } catch (errore) {
                alert("Invio non riuscito. Controlla la connessione e riprova.");
                ripristina();
            }
        });
    }

    globalThis.creaModuloPdf = creaModuloPdf;
    if (typeof document !== "undefined") init();
})();
