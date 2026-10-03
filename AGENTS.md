<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the kiosk shell at a responsive 5:8 aspect ratio with a fixed 3:1 interactive-to-ad grid so 1440×2304 displays preserve the intended composition.
- Treat the complete semicolon-delimited SOGIL CSV as the schedule source of truth; its times are origin departures, while totem arrivals are estimated from routed travel duration.
- Keep geocoding and OSRM routing client-side with persistent caches and graceful no-straight-line failure states because the kiosk currently has no backend.
