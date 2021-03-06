# Transtory

CLI for creating and managing translation files from Sheet.

## 📦 Installation

```bash
npm install -g transtory
```

## 🚀 Tutorial

```bash
transtory init
#
# Configure .transtory
#
# Fetch rows from GoogleSpreadSheet
transtory sheet fetch
# Update locales from GoogleSpreadSheet
transtory locale update
# Get locale(ja) from local
transtory locale get ja
# Get all locales from local
transtory locale get
# Push GoogleSpreadSheet from Local
transtory sheet push
# Add locale
transtory locale add en en.common.text.good_bye "Good Bye"
```

## 📖 Usage

```bash
$ transtory -h
Usage: transtory [options] [command]

transtory cli

Options:
  -V, --version  output the version number
  -h, --help     output usage information

Commands:
  init           create setting file (.transtory)
  sheet          sheet utils
  locale         locale utils
```

## ❤️ Support Sheets

- GoogleSpreadSheet

## ⚙ .transtory

The configuration file called `.transtory` is a file that contains all settings.

- Schema information of the translation file managed by GoogleSpreadSheet.
- Authentication information for using GoogleSpreadSheetAPI.
- Information such as output destination of deliverables.


The default settings are as follows:

```yaml
---
version: '1.0.0'
sheet:
  gss:
    url: <your/GoogleSpreadSheet/url>
    openAPIV3Schema:
      type: object
      properties:
        ja:
          type: string
          description: 日本語
        en:
          type: string
          description: 英語
        key:
          type: string
          description: キー
    langPrefix: true
locale:
  distDirPath: ./dist/locales
auth:
  credPath: ./creds.json
```

Note:

The name "key" is a reserved word. Be sure to use this name.
