# Plan for to kampanjeflyter og anbefalt MVP

Arbeidsutkast for Sona · 27. oktober 2026

## Avklaringer og lokal fremdrift

- Første fokus er å ferdigstille den forenklede v2-flyten. Bare hovedflyten og v2 inngår i sammenligningen.
- Sona har valgt redigering per seksjon i modal. Stillingen, Kampanjen og Materiell og filer har hver sin «Endre»-handling. Kampanjenavn står sammen med budsjett, kanaler og periode. Modalene åpner med nedtrekkslistene lukket.
- Sona har flyttet kampanjenavn inn i tekstmalen på første side. Det separate feltet vises bare i redigering av Kampanjen i oversikten. Navnet hentes fra «Kampanjenavn:» i teksten; ved import kan stillingstittelen brukes som forslag. Et navn må være på plass ved innsending.
- «Informasjon om stillingen» står først som større overskrift. En rød varselboks med lys rød bakgrunn viser når grunnlaget mangler. Brukeren kan skrive fritt, lime inn tekst eller sette inn en utfyllingsmal; tomme stikkord teller ikke som opplysninger. Kravet om minst én kilde er samlet ved kildevalgene.
- Sona har nå valgt å hente bestillingsreglene fra hovedflyten inn i V2: navn/referanse, stilling, arbeidssted, budsjett og minst én kanal må være på plass. Kanalminimum kontrolleres. Perioden får hovedflytens standard og kan endres. Materiell og vedlegg er fortsatt valgfrie ved bestilling; manglende materiell må avklares før publisering. Den lokale bestillingen åpner kampanjesiden. Ingen faktisk bestilling sendes.
- «Tilleggsprodukter» har en egen, åpen seksjon med strategisk rådgivning og «Meld interesse». Valgene og prisene er synlige direkte i oversikten og oppdaterer totalen uten modal. Valg og priser følger bestillingen. Bestillingsknappen er deaktivert til obligatoriske opplysninger og kanalminimum er oppfylt, med en synlig forklaring. Kampanjenavn står før pakkevelgeren; pakkealternativene viser navn, budsjett og kanaler. Fakturamottaker vises som en åpen nedtrekksliste i bestillingsseksjonen, uten redigeringsmodal. Avsender, lagrede pakker, estimater og valgfri godkjenning før bestilling er koblet til V2. Ventende godkjenning blokkerer bestilling; lagrede endringer krever ny vurdering, mens avbryt bevarer godkjenningen.
- Tilleggsinformasjon har en egen seksjon med et åpent, valgfritt tekstfelt. Hentede opplysninger fylles inn; feltet er også synlig når ingenting er funnet. Opplysningene følger bestillingen videre. Geografi i et eksplisitt målrettingsønske skal ikke bli et ekstra arbeidssted. Kampanjemodalen viser ikke kanalfeil bare fordi den åpnes med tomme valg.
- Annonsebyggeren er koblet til «Lag annonsen selv» i materiellmodalen: bilde, tekst, utforming, utsnitt, logo, farger, knapp og forhåndsvisning. Ferdige annonser og designbrief bruker de eksisterende kontrollene fra hovedflyten.
- Første kort og oversikten er gjort litt bredere. Tekstfeltet heter «Skriv øvrig informasjon om stillingen eller kampanjen». Vedlegg støtter flere filer, flere opplastinger og fjerning av enkeltfiler, med maks 10 MB per fil.
- Lokal nettleserkontroll er gjort av seksjonsmodaler, lagring av flere felt, avbryt, lukkede nedtrekkslister, navnekravet og bekreftelse med manglende detaljer. Annonseutkast og flere vedlegg er kontrollert på kampanjesiden etter oppdatering. Lagring på tvers av enheter og faktisk innsending gjenstår.
- Kampanjemodalen bruker samme brede størrelse som annonsebyggeren. Etter Sonas tilbakemelding leses feltene radvis: navn og pakke, deretter budsjett og kanaler, til slutt startdato og antall uker. Topp og knapper står fast, innholdet ruller, og «Flere valg nedenfor» vises ved mer innhold. Smale skjermer får samme rekkefølge i én kolonne. Avstander i forhåndsvisningen, budsjettforklaringen og bestillingsknappene er rettet. V2 er kontrollert lokalt på desktop og mobil; Sona har godkjent å lagre endringene i en commit.
- Claude har oppdatert den delte sidebakgrunnen til lys gråblå med hvite kort. Endringen er bevart.
- Sona har avgrenset annonsebyggeren til ett bilde per annonse i MVP. Flere egenbygde annonser utsettes. Ferdige annonser beholdes som levert; brukeren laster opp riktige størrelser. Generelle vedlegg i materiellmodalen vises bare ved «Bestill design fra Frantz».

## Sammenligning av tilgjengelige funksjoner i A og B

Gapene under ble kartlagt 27. oktober, før oppdateringen av bestillingslogikken. Tilleggsprodukter, faktura, avsender, pris, plangodkjenning, lagrede pakker og estimater er deretter koblet til V2 som beskrevet over. Hovedflytens faste leveringstid er ikke overført som et løfte. Dette er en sammenligning av prototypene, ikke en vurdering av produksjonsklarhet.

| Funksjon i hovedflyten A | Hva som mangler i forenklet B | Anbefalt plassering eller prioritet |
| --- | --- | --- |
| Tilleggsprodukter, med aktivt valg av strategisk rådgivning og «Meld interesse» | Ingen tilgjengelig velger. Bestillingen lagrer en tom tilleggsliste. | Egen seksjon «Tilleggsprodukter» etter materiell, før fritekst. Vis pris eller «Inkludert» og oppdater totalsummen. Ikke bestill betalte tillegg automatisk fra teksten. |
| Velge fakturamottaker | B bruker verdien fra et skjult felt uten at brukeren kan kontrollere eller endre den. | Synlig ved bestilling. Høy prioritet, særlig for byråer. |
| Se og endre annonseavsender | Kan endres i byggerens avanserte innstillinger, men mangler som synlig opplysning for alle materialruter. | Vis under «Materiell og filer», også for ferdige annonser og Frantz-design. |
| Samlet pris før bestilling | B viser budsjett og designets prisgrunnlag i modal, men ingen samlet prisoversikt før bestilling. Total settes foreløpig lik budsjettet. | Bestillingsområde med budsjett, valgte tillegg, avklaring av designkostnad og total eks. mva. |
| Sende planen til kunde eller kollega for godkjenning før bestilling | Delingsknappen og håndteringen av ventende/endret godkjenning er ikke koblet til B sin bestillingsknapp. | Valgfri handling ved bestilling. Godkjenning av annonsemateriell etter bestilling er allerede på den felles kampanjesiden. |
| Bruke lagrede pakker | Pakkevelgeren er skjult i B. | I kampanjemodalen hvis pakker skal være med i MVP. |
| Estimert resultat | Visninger, klikk og forventet «Søk» vises i A, men er skjult i B. | Kan utsettes. Tall og modell må bekreftes før de brukes som beslutningsgrunnlag. |
| Veiledning om tidligste oppstart og advarsel når perioden går forbi søknadsfristen i bestillingsoversikten | B mangler denne synlige veiledningen i oversikten. Datokontrollen finnes fortsatt. | Vis relevante avklaringer ved periode/bestilling. Ikke overfør prototypens faste leveringstid som et bekreftet løfte. |

Bevisste forskjeller er ikke funksjonsgap: B tillater bestilling uten ferdig materiell, bruker seksjonsmodaler og har kampanjenavn/referansekode i tekstmalen. De tre materialrutene og videreføring til kampanjesiden finnes i begge. Gjenopptak av utkast med alle filer må verifiseres separat i begge; en lagreindikator er ikke tilstrekkelig dokumentasjon.

Forslag til seksjonsrekkefølge i B: Stillingen → Kampanjen → Materiell og filer → **Tilleggsprodukter** → **Tilleggsinformasjon** → bestillingsområde med fakturamottaker, pris og eventuell godkjenning. «Tilleggsinformasjon» forblir fritekst. Denne seksjonsdelingen er nå lagt inn i den lokale V2-prototypen.

Anbefalingen er å lage to sammenlignbare designversjoner med samme innhold og regler: én veiledet flyt og én samlet oversikt. Begge må fungere for direktekunder og byråer, slik Sona har avklart. Test begge før vi anbefaler hvilken som skal lanseres. To designversjoner betyr ikke at begge må utvikles til lansering.

MVP-en bør gjøre det mulig å starte med det man har, styre budsjettet, få på plass annonsene, innhente nødvendig godkjenning og følge bestillingen videre. Leveringsdato, utviklingsbudsjett og kapasitet er [GAP]. Prioriteringen under er et forslag til klientbeslutning, ikke et avtalt leveranseomfang.

## Designene vi sammenligner

| Versjon | Lokal forhåndsvisning | Hva den skal hjelpe brukeren med |
| --- | --- | --- |
| A Veiledet flyt | [Hovedflyten](http://127.0.0.1:8080/portal/ny-kampanje.html) | Stillingen → Kampanjen → Annonsen → Se over og bestill. Beholde veiledning og oversikt underveis. |
| B Ny forenklet flyt | [Revisjonen på campaign-flow-v2](http://127.0.0.1:8080/portal/ny-kampanje-v2.html) | Samme startside → oppsummering av det som er hentet ut → rett og legg til i radene. Skjuler de opprinnelige stegene etter innlesing. |

Arbeidsmappen står på `campaign-flow-v2`, commit `8e5e0c3`. Branchens tillegg sammenlignet med lokal `main` er `ny-kampanje-v2.html`. Sona har avgrenset sammenligningen til hovedflyten og den forenklede v2-flyten.

## Gap ved starten av gjennomgangen

| Gap | Konsekvens | Oppgave |
| --- | --- | --- |
| B lar brukeren velge «Lager annonsen selv», men valget åpner bare en valgkontroll | Den opprinnelige annonsebyggeren finnes i filen, men er skjult fra denne reisen | Koble materiellraden til en ordentlig annonseredigerer med forhåndsvisning. Gjenbruk funksjonene fra A. |
| B krever verdi i alle oppsummeringsrader, også fil og kampanjenavn, uansett materialrute | Fil kreves også når Frantz skal designe; kampanjenavn er merket valgfritt på første side, men blir obligatorisk senere | Lage krav per rute. Skille valgfrie felt fra publiseringskrav. Et stillingsvedlegg teller ikke som ferdig annonse. Designbestilling skal ikke kreve en ferdig annonsefil. |
| B sin bestillingsknapp kontrollerer utfylte rader og viser «Skissen er fylt ut. Ingenting er sendt.» | Oppsummeringen går utenom den opprinnelige gjennomgangen, godkjenningen og ordrehåndteringen | Koble totalsum, fakturamottaker, godkjenning, lagring og bestillingsbekreftelse til samme grunnlag som A. |
| «Bestill», «send til avklaring» og «klar til publisering» er ikke tydelig nok avgrenset | Brukeren kan misforstå hva de forplikter seg til, og hva Frantz gjør videre | Avtale hva som kreves ved hvert punkt og vise mangler, ansvar og neste handling. |
| Byrå, arbeidsgiver, annonseavsender, fakturamottaker og godkjenner kan være ulike aktører | Feil profil, faktura eller mottaker | Vise hvem kampanjen gjelder, hvem som betaler, hvem som er avsender, og hvem som skal godkjenne. |

Oppsummeringen i B er sett i nettleseren. Kravene og koblingen til bestillingshandlingene er kontrollert i lokal kode. Dette er en målrettet gjennomgang, ikke en full kvalitetstest av alle skjermbilder.

## Når brukeren ikke har en ferdig annonse

Begge versjoner bør tilby disse tre veiene når materiell skal velges. Ikke velg en betalt designtjeneste automatisk fra fritekst.

| Brukerens situasjon | Vei | Hva som må finnes før annonsen er klar |
| --- | --- | --- |
| Har ferdige annonser | «Jeg har ferdige annonser» | Last opp én eller flere filer, koble til aktuelle kanaler/formater og se dem uten ekstra tekst eller logo oppå. |
| Har bilde og trenger å lage annonsen | «Lag annonsen selv» | Velg/last opp bilde, legg til og rediger tekst, bruk riktig logo/profil, juster utsnitt og kontroller forhåndsvisningen for kanalene som er valgt. Begrens MVP til få gode maler. |
| Trenger at Frantz lager den, eller mangler også bilder | «Bestill design fra Frantz» | Kort brief, valgfrie vedlegg, tydelig prisgrunnlag eller prisavklaring, ansvar og neste steg. Designutkastet må senere kunne vises og godkjennes. |

Forslag for B: «Lag annonsen selv» åpner en egen, romslig redigeringsvisning. Når brukeren går tilbake, viser oversikten miniatyr, valgt rute og hva som gjenstår. Unngå å presse hele annonsebyggeren inn i oppsummeringsraden.

Hvis materialet kommer senere, skal arbeidet kunne lagres som utkast. Om kunden også kan sende en foreløpig bestilling før materialet er klart, må Frantz avgjøre. Ingen uferdig annonse skal fremstå som klar til publisering.

## Anbefalt MVP

Prioriter først det som stopper en bestilling, kan gi feil kjøp eller hindrer Frantz i å levere. Deretter kommer gjentakende manuelt arbeid. Nye funksjoner med uavklart datagrunnlag eller stor avhengighet bør vente. Eksisterende funksjoner må kartlegges før klienten bestemmer hva som kan utsettes i en erstatning av dagens løsning.

| Prioritet | Funksjon | Hvorfor og minste nyttige omfang |
| --- | --- | --- |
| Må med | Én tydelig inngang til kampanjebestilling | Starte fra lenke, tekst, vedlegg eller eksisterende stilling der kunden har tilgang. Vise og rette hentede opplysninger før man går videre. Manuell vei når lesing feiler. |
| Må med | Utkast som kan gjenopptas | Link og materiell er ikke alltid klare samtidig. Beholde felter og filer ved tilbake, oppdatering og senere retur. |
| Må med | Budsjett, kanaler, periode og forståelig pris | Kunden styrer rammen. Vise kjøpte tjenester, tillegg, fakturamottaker og hva design eventuelt koster ekstra. Avklare faktiske minimumsregler. |
| Må med | Ferdige annonser og enkel annonsebygger | Dekke både byråets ferdige materiell og direktekunden med bilde/tekst. Forhåndsvise faktisk innhold og støttede kanalformater. |
| Må med | Bestille design fra Frantz | Komplett alternativ når selvbetjening ikke passer. Brief, prisavklaring og vei tilbake til korrektur. |
| Må med | Enkel deling for godkjenning | Leder eller kunde kan vurdere relevant plan/materiale uten egen portalbruker. Vise hvilket innhold som er godkjent, tilbakemelding og når endringer krever ny vurdering. Ikke tvinge alle gjennom to godkjenningsrunder. |
| Må med | Tydelig overlevering og kampanjeside | Bestillingsbekreftelse, status, mangler, neste steg, kontakt og materiale samlet per kampanje. Holde bestilling adskilt fra publisering. |
| Må med | Riktig selskap, avsender og faktura | Dekke både direkte bestilling og byrå som bestiller for kunde. Minste nødvendige roller og tilgang. |
| Må med | Mobil, tastatur og forståelige feil | Hele bestillingen og godkjenningen skal være brukbar på liten skjerm og uten mus. |
| Må avklares som del av lanseringen | Eksisterende Connect, sporing, rapporter og interessenter | Beholde kritiske eksisterende arbeidsmåter. Hyr trenger sporingskode før alt er bestillingsklart. Avklar med Kenneth hvilke integrasjoner som kan gjenbrukes. Bevar daglige rapporttall som avtalt; ikke krev full rapportombygging for å lansere bestillingsflyten. |
| Bør med hvis kapasitet | Velge eksisterende lagret pakke | God støtte for gjentakende byråbestillinger. Uavhengig periode. Gjenbruk eksisterende oppsett hvis mulig. Full administrasjon av egne pakker kan avgrenses separat. |
| Bør med hvis kapasitet | Målgruppe synlig før aktivering | Vise Frantz sitt oppsett og gi en enkel mulighet til å kommentere. Manuell behandling kan være første løsning. |
| Bør med hvis kapasitet | Enkel gjenbruk av kundeprofil | Riktig logo og farger uten gjentatt arbeid. Avklar hvor profilene allerede finnes før ny profiladministrasjon bygges. |
| Senere | Full AI-assistent og chat i portalen | Møtenotatet 20. oktober avgrenser AI til utfylling og utsetter chat. Bruk eksisterende kontaktkanal knyttet til kampanjen. |
| Senere | Nytt mediebibliotek og avansert designverktøy | Gjenbruk eksisterende bibliotek. Utsett mange maler, fri layout og avansert videoredigering. Opplasting av ferdig video må vurderes separat dersom det er nødvendig i første kundesett. |
| Senere | Nye benchmark, A/B-testing og resultatprognoser | Viktige ønsker, men krever pålitelig datagrunnlag. Eksempeltall i en prototype er ikke tilstrekkelig. |
| Senere | Nye API-integrasjoner, avanserte byråpriser og sluttkundeportal | Vurdere etter kartlegging av eksisterende integrasjoner og valgt første kundesett. Ikke fjerne nødvendig støtte som kundene allerede bruker. |

Forslag til klientformulering:

> Vi anbefaler at første versjon dekker hele veien fra et uferdig grunnlag til en bestilling som Frantz kan følge opp. Kunden må kunne styre budsjettet, levere ferdige annonser eller lage en enkel annonse, be Frantz om design og få godkjenning fra leder eller kunde. Vi foreslår å vente med full AI-assistent, chat, nytt mediebibliotek og avanserte analysefunksjoner. Vi vil teste den veiledede og den forenklede flyten på de samme oppgavene før vi anbefaler utformingen til lansering.

## Oppgaver i anbefalt rekkefølge

Alle oppgaver står åpne. Tabellen angir foreslått ansvar, ikke avtalte oppdrag.

| Nr | Oppgave | Foreslått ansvar | Avhengighet og ferdig når |
| --- | --- | --- | --- |
| 1 | Bekrefte A som den veiledede hovedflyten og B som den nye oppsummeringsflyten | Sona | Før designarbeid. Begge referanser er bevart og lette å åpne. |
| 2 | Avgrense første kundesett, lanseringsmål, dato og utviklingsramme | Sona, Tore og Kenneth | Begge målgrupper er bekreftet; konkrete første kunder og rammer gjenstår. |
| 3 | Lage funksjonsoversikt med «finnes i dag», «prototype» og «må utvikles» | Sona og Kenneth | Kartlegg også eksisterende integrasjoner og administrativ behandling. Ingen prototypefunksjon telles som produksjonsklar uten kontroll. |
| 4 | Avtale tilstander og krav ved utkast, bestilling og publisering | Tore og Kenneth, med Sona | Definere om foreløpig bestilling tillates, når penger forpliktes, hvem som avklarer mangler og hva som blokkerer aktivering. |
| 5 | Avklare pris og leveranse | Tore og Kenneth | Kanalminimum, pakker uten fast periode, designkostnad, fakturering, støttede formater og realistisk oppstartstid er entydige. Ikke gjenbruke gamle tall som bekreftede vilkår. |
| 6 | Lage felles oversikt over felter, filer, status og feil | Sona og utvikler | Begge versjoner bruker samme opplysninger, prisregler og definisjon av hva som er komplett. Grunnlagsfiler skilles fra annonsene. |
| 7 | Lage felles testinnhold og oppgaver | Sona | Direktekunde med bilde, byrå med ferdige annonser, designbestilling og ufullstendig grunnlag er dekket. Bruke realistisk materiell fra Frantz. |
| 8 | Gjennomgå A og rette nødvendige hull | Sona | Innhenting, bekreftelse, budsjett, tre materialruter, gjennomgang og videre status henger sammen. Bevare valgt fullbreddeoppsett. |
| 9 | Tegne materialreisen i B | Sona | Oversikt → velg materialrute → rediger/last opp/bestill design → tilbake til oppdatert oversikt. Første prioritet i B. |
| 10 | Koble en enkel annonsebygger til B | Sona eller utvikler | «Lager annonsen selv» åpner faktisk redigering. Bilde, tekst, profil, utsnitt og kanalvisning virker. Ferdige annonser beholder originalt utseende. Ingen ny animasjon før design er godkjent. |
| 11 | Rette krav til filer og manglende innhold | Sona og utvikler | Et stillingsvedlegg teller ikke som ferdig annonse. Designbestilling krever ikke ferdig annonsefil. Kampanjenavn behandles likt på første side og i oversikten. Mangler får tydelig handling og riktig status. Bytte av rute bevarer arbeidet. |
| 12 | Gjøre pris, avsender og fakturamottaker tydelige i begge | Sona | Samme bestilling viser samme pris og aktører i A og B. Forslag aksepteres eksplisitt; betalte tjenester velges aktivt. |
| 13 | Fullføre gjenopptakelse og tilbakeveier i B | Utvikler, med Sona | Utkast og originalfiler overlever retur og ny økt. Endret grunnlag overskriver ikke manuelle rettelser uten at brukeren forstår det. |
| 14 | Koble godkjenning til begge flyter og kampanjesiden | Sona og utvikler | Deling, tilbakemelding, endring, ny godkjenning og allerede godkjent materiale er gjennomgått. Ekstern godkjenning fungerer senere på en annen enhet i produksjon. |
| 15 | Lage etter bestilling og designkorrektur som sammenhengende reise | Sona og Frantz | Kunden finner bestillingen, filer, ansvar, mangler og neste handling. Frantz kan levere utkast tilbake og få det godkjent. |
| 16 | Kontrollere mobil og tilgjengelighet | Sona og utvikler | 320/390, 768/1024 og desktop; tastatur, fokus, feil og opplasting. Samme innhold og oppgaver på alle størrelser. |
| 17 | Teste A og B med både direktekunder og byråer | Sona | Samme oppgaver og like komplett innhold. Variere hvilken versjon deltakerne ser først. Observere gjennomføring og misforståelser, ikke bare preferanse. |
| 18 | Oppdatere MVP-listen med brukerfunn og utviklingsvurdering | Sona og Kenneth | Hver funksjon har behov, minste omfang, avhengigheter, grov innsats og beslutning. Unngå poengsummer uten grunnlag. |
| 19 | Presentere anbefalt flyt og MVP til klienten | Sona | Tore og Kenneth kan velge flyt, bekrefte omfang og se hva som bevisst kommer senere. |
| 20 | Lage utviklingsoppgaver for valgt lanseringsomfang | Utvikler, Kenneth og Sona | Beskrive lagring av utkast/filer, tilgang, faktisk e-post/godkjenning, ordrehåndtering, integrasjoner, feilhåndtering og videreføring av eksisterende kundedata. Avtalt ansvar per oppgave. |
| 21 | Verifisere hele løsningen før lansering | Leveranseteamet og Frantz | Kundens handling lagres riktig, rådgiver kan behandle den, godkjenning og vedlegg fungerer på tvers av enheter, og publisering følger avtalte regler. |

Oppgave 2–5 kan avklares mens Sona kartlegger 6–7. Arbeid på B begynner med 9–10 etter at felles materialreise er valgt. Brukertesten kommer når begge versjoner løser samme oppgaver. Utviklingsestimat og brukerfunn avgjør endelig MVP.

## Oppgaver i brukertesten

| Situasjon | Oppgave | Det vi må se etter |
| --- | --- | --- |
| Direktekunde med bilde og tekst | Opprett kampanje innen en gitt budsjettramme og lag annonsen | Finner brukeren riktig vei, forstår prisen og kan vurdere annonsen før bestilling? |
| Byrå med godkjente annonser | Last opp flere ferdige filer for en kunde og velg fakturamottaker | Bevares annonsene uten uønskede tillegg? Er kunde, avsender, kanaler og betaling forståelig? |
| Bruker uten materiell | Be Frantz om design, få korrektur og godkjenn | Forstår brukeren hva de kjøper, hva det kan koste og hvem som gjør neste jobb? |
| Ufullstendig oppdrag | Start uten ferdig lenke/materiale og kom tilbake senere | Kan brukeren fortsette uten tap av arbeid eller inntrykk av at kampanjen allerede skal publiseres? |
| Leder eller kunde skal godkjenne | Del plan/annonser, be om endring og se ny versjon | Er det tydelig hva som godkjennes, om innhold er endret og hva som fortsatt gjenstår? |

Noter gjennomføring uten hjelp, feil/misforståelser, behov for forklaring og om brukeren forstår forpliktelsen ved «Bestill». Se spesielt etter forskjeller mellom målgruppene. Avtal konkrete mål etter en kort første test; ingen grunnlag for å love en bestemt tidsbesparelse ennå.

## Beslutninger til neste gjennomgang

1. Skal første versjon ha én valgt flyt, eller et dokumentert behov for begge? Anbefaling: utvikle én først, behold begge som sammenligningsgrunnlag.
2. Kan kunden bestille før materiell og lenke er klare, eller skal dette være et utkast/en forespørsel? Hva forplikter kunden seg til?
3. Hvilke annonseformater og eventuell ferdig video må støttes ved første lansering? Frantz må levere eksempler og krav.
4. Hva er riktig designpris, avklaringsløp og forventet tid til korrektur og oppstart?
5. Hvilke eksisterende funksjoner, integrasjoner, rapporter og interessentoppgaver må videreføres for de første kundene? Hvem avklarer nødvendig behandling av kontaktopplysninger?
6. Hvilken dato, kapasitet og utviklingsramme skal MVP-en passe innenfor?

## Kilder og status

- Lokal kontroll 27. oktober: gitstatus og brancheforskjell; hovedflyten og v2-flyten; oppsummeringen med mangler i B i nettleseren. Ingen designendring eller publisering er gjort.
- [Designgjennomgang 20. oktober](../feedback/2026-10-20-designgjennomgang-og-endringer.md): gjengitte beslutninger om én annonsebygger, begrenset AI, godkjenning, pakker, bibliotek og chat. Møtenotatets daværende gitstatus er historisk.
- [Lokale flytvalg og verifikasjoner](../feedback/2026-10-20-campaign-flow-refinement.md): Sona sine valg, materialruter og referanser til godkjenningsbehov. Skiller lokale valg fra klientgodkjenning.
- [Karoline, Hyr, 7. oktober](</Users/sonashyamsukha/Desktop/Kunder/Frantz/2-research/intervjunotater/intervju-karoline-hyr-2026-10-07.md>): pakker, eget materiell, tidlig sporingskode og riktig fakturamottaker. Se hovedfunn og P1, P6, P12–13 og P18.
- [Jon Alfred, Sortland, 28. september](</Users/sonashyamsukha/Desktop/Kunder/Frantz/2-research/intervjunotater/intervju-jon-alfred-sortland-2026-09-28.md>): prisramme, forhåndsvisning, ledergodkjenning og bilder i Autopublish. Se P2–4 og innsikt 1–5. Ett offentlig kundecase gir ikke grunnlag for å generalisere til alle direktekunder.
- [Øyvind, Vitring, 28. september](</Users/sonashyamsukha/Desktop/Kunder/Frantz/2-research/intervjunotater/intervju-oyvind-vitring-2026-09-28.md>): bestilling før materialet er klart, fast budsjett, materiellrunder og kundegodkjenning. Se P1, P5 og P7–9.
- [README](../README.md): godkjenning, e-post og lagring er demonstrasjoner i nettleseren. Produksjonsarbeid må vurderes separat.

De gjennomgåtte intervjunotatene er bearbeidede kilder med tidsreferanser. Originalopptak er ikke kontrollert i denne gjennomgangen. Endelig prioritering må også ta hensyn til innsats og avhengigheter vurdert av Kenneth/utvikler.
