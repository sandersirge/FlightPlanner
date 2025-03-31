# FlightPlanner

This is the repository for CGI summer internship 2025 test assigment.

Some small functionalities missing or not implemented.

To run the application with Docker:
```aiignore
1. $ docker login -u <username>

2. $ docker build -t testassignment

3. $ docker images "-> look up the repo_name, should be testassignment"

4. $ docker run -p 8080:8080 testassignment
```
The page should open up on localhost:8080

## Documentation: ##

Projekti tegemiseks kulus mul umbes 26 tundi. Tööd alustasin projekti struktuuri loomisega, kasutades frontendis HTML-i, CSS-i ja JavaScripti, samal ajal kui backendis rakendasin Spring Boot’i.

Backendi arendamisel alustasin objektide loomisest ja kontrolleri kirjutamisest. Kuna mul puudus eelnev kogemus Spring Bootiga, pidin põhjalikult tutvuma dokumentatsiooniga ja õppevideotega, kasutades tehisintellekti abi keerulisematest asjadest arusaamiseks.

Frontendis lõin esmalt kõik vajalikud leheküljed ja kujundasin need CSS-i abil. See osa oli suhteliselt lihtne, kuna olen nende tehnoloogiatega juba tuttav. Seejärel lisasin JavaScripti abil dünaamilist funktsionaalsust, kus tehisintellekt aitas mul lahendada mõningaid probleeme.

Lendude andmete kuvamiseks integreerisin AviationStack API, mis võimaldas kuvada reaalseid lennuandmeid. Avalehele implementeerisin filtreerimisfunktsionaalsuse, mis võimaldab lende filtreerida sihtkoha, kuupäeva, väljumisaja, kestvuse ja hinna alusel. Filtreid saab nuppude abil nii rakendada kui tühistada. Kuigi filtreerimise koodi kirjutamine ei olnud kõige keerulisem, aitas tehisintellekt mul alguses tekkinud probleeme lahendada.

Istmevaliku lehe arendamisel lõin filtreerimise võimalused, mis võimaldavad valida istekohad järgmiste parameetrite alusel:
- Aknaäärsed kohad
- Rohkem jalaruumi pakkuvad kohad
- Väljapääsudele lähedal asuvad kohad
- Kõrvuti asuvad kohad
- Klass (Esimene, Business või Economy)

Kuigi püüdsin luua võimalikult täpse algoritmi, valiti mõnel juhul siiski mitte kõige optimaalsemaid kohti. Probleemi lahenduseks võiks olla täiustatud filtreerimisalgoritm või erinevate filtrite prioriteetide seadmine.

Lõpuks lõin lehekülje salvestatud lennuplaanide kuvamiseks. Lõin funktsionaalsused plaanide vaatamiseks, redigeerimiseks ja kustutamiseks. Kustutamine töötab korralikult, kuid vaatamisel ja redigeerimisel tekib probleeme andmete kuvamisega - osad väljad jäävad tühjaks ja redigeerimisel luuakse alati uus istumisplaan. Probleemi lahenduseks võiks olla andmebaasi suurem kasutuselevõtt, kus planeeringute info oleks kergemini kättesaadav nii vaatamiseks kui ka muutmiseks.

Projekti lõpetuseks pakkisin rakenduse Dockeri konteinerisse ja laadisin selle ülesse GitHubi koodihoidlasse, lisades sinna ka juhised rakenduse käivitamiseks.
