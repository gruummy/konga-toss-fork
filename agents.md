# Agent-Vorgaben für Konga-TOSS-Fork Projekt

## Datum: 15. Februar 2026

Diese Datei enthält verbindliche Vorgaben für alle automatisierten Agents, die an diesem Projekt arbeiten.

---

## 1. WSL & Docker Umgebung

### 1.1 WSL Distribution
- **Zu verwendende WSL Distro:** `Ubuntu-Docker`
- **Verbot:** Innerhalb der WSL Distro "Ubuntu-Docker" darf NICHTS installiert werden
- **Alle Arbeiten müssen in Docker Containern ausgeführt werden**

### 1.2 Docker Container
- Erstelle für jede Aufgabe dedizierte Docker Container in der WSL Distro "Ubuntu-Docker"
- Container müssen nach Aufgabenbereich benannt und organisiert sein
- Verwende offizielle Base-Images wo möglich

---

## 2. Datenspeicherung & Persistenz

### 2.1 Temporäre und Persistente Daten
**Alle** temporären oder persistenten Daten/Änderungen innerhalb von Docker Containern **MÜSSEN** ausschließlich in folgendem Verzeichnis gespeichert werden:

```
/mnt/d/tmp/konga-toss-fork/
```

### 2.2 Strukturierung
Die Daten in `/mnt/d/tmp/konga-toss-fork/` müssen **gut strukturiert** sein:
- Für Menschen jederzeit nachvollziehbar
- Offensichtliche Benennung von Verzeichnissen
- README-Dateien in Unterverzeichnissen zur Erklärung

**Beispiel-Struktur:**
```
/mnt/d/tmp/konga-toss-fork/
├── README.md                      # Übersicht über alle Daten
├── node-modules/                  # Node.js Dependencies
├── bower-components/              # Bower Dependencies
├── build-output/                  # Kompilierte Assets
├── docker-volumes/                # Docker Volume Daten
│   ├── postgres/                  # PostgreSQL Daten
│   └── mongo/                     # MongoDB Daten
├── logs/                          # Build & Runtime Logs
└── cache/                         # Build Cache
```

---

## 3. Projekt-Dokumentation

### 3.1 TOSS-Spezifische Dokumentation
- **Verzeichnis:** `/toss/` (im Repo-Root)
- Alle umbau-spezifischen Dokumentationen gehören in dieses Verzeichnis
- Dokumentiere Design-Entscheidungen, Migrationsschritte, etc.

### 3.2 Existierende Dokumentationen
- Existierende Dokumentationen im Repo dürfen aktualisiert werden
- Halte Änderungen nachvollziehbar
- Dokumentiere Breaking Changes

---

## 4. Version Control

### 4.1 Commits & Staging
**VERBOT:** Agent darf KEINE Commits oder Staging von Änderungen vornehmen

**Ausnahme:** Falls es absolut notwendig ist:
→ **Explizite Rückfrage an den Benutzer stellen**

### 4.2 Dateiänderungen
- Dateiänderungen sind erlaubt
- Neue Dateien erstellen ist erlaubt
- Aber: Kein `git add`, `git commit`, `git push`

---

## 5. Eskalation bei Abweichungen

**Falls es KEINEN anderen Weg gibt, ohne von diesen Vorgaben abzuweichen:**
→ **STOP** und **explizit um Entscheidung des Benutzers fragen**

Niemals selbstständig von diesen Vorgaben abweichen!

---

## 6. WSL Distro Zugriff

### 6.1 Distro wechseln
```bash
wsl -d Ubuntu-Docker
```

### 6.2 Commands in WSL ausführen
```bash
wsl -d Ubuntu-Docker -- <command>
```

### 6.3 Docker in WSL nutzen
```bash
wsl -d Ubuntu-Docker -- docker run ...
```

---

## 7. Language Requirements

### 7.1 Documentation & Code Language
**ALL documentation, code, comments, tests, and file content MUST be written in ENGLISH**

- ✅ Documentation files (.md, .txt, etc.): English
- ✅ Code comments: English
- ✅ Variable/function names: English
- ✅ Test descriptions: English
- ✅ Commit messages: English (when applicable)
- ✅ README files: English

**Exception:** Communication with the user can remain in German if requested.

---

## 8. Important Principles

1. ✅ **Isolation:** All work in Docker containers
2. ✅ **Cleanliness:** WSL distro remains unchanged
3. ✅ **Traceability:** Well-structured data
4. ✅ **Transparency:** Document all steps
5. ✅ **Control:** User retains Git control
6. ✅ **Language:** All files in English

---

## Status: ACTIVE
These guidelines are binding for all agent operations on this project as of now.
