# <NN>. <Flow name>

## How the flow is entered

- From which screen, by what action, or under what condition (a guard, a deep link, a
  notification).

## Steps

| # | Screen | Route | What the user does | Where it leads |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |

## UI states per screen

| Screen | Loading | Empty | Content | Error |
|---|---|---|---|---|
| | | | | |

## How the flow is left

- On success → ...
- On cancel part-way → ... (does entered data survive? say so explicitly.)
- On browser back / iOS edge swipe → ...

## Notes

- Which destructive actions need a confirmation dialog.
- Where the keyboard covers content (see `src/pwa/viewportInsets.ts`).
