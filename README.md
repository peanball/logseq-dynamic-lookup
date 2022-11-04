# Dynamic Lookup Plugin

This plugin allows you to look up properties on a target page and place the value of the property in your text.

Great for macros that automatically augment links to specific pages or tags.

## Demo

```clojure
{{renderer :lookup, page, property, template, fallbackTemplate}}
```

- `page` is the name (`:block/original-name`, i.e. the name you see in the UI) of the page
- `property` is the name of the property
- `template` is an optional formatter for the value. This can contain HTML to wrap the property value as needed. By default, the property value is added verbatim in a `<span>`.
- `fallbackTemplate` is an optional formatter for the value. This can contain test that is printed when the page or property value could not be found.

When the `page` could not be found, or the `page` does not have the property defined via `property`, the renderer block uses the `fallbackTemplate` if one is defined.  
If none is defined, the block is replaced with nothing. This makes it safe to use in macros, even if e.g. the target page does not exist (yet).

### Use Case

I've defined a macro `jira` in the custom.edn file that links to my notes to specific JIRA tickets where I use the issue ID as tag:

```clojure
:macros {
    "jira" "#$1 {{renderer :lookup, $1, summary, ($value)}}"
}
```

The page `PROJ-123` has a property `summary:: This is a summary`.

The result looks something like this:

<span style="background: rgb(64,128,255); padding: 0.2em 0.4em; border-radius: 1em; color: white;">#PROJ-123</span> (This is a summary)

You could also use it to link to the actual issue. In a macro `$1`, `$2`, etc. can be used to define the template dynamically if needed.

## Building

> 🏷 Currently this only builds on Node <= 16.

- `pnpm install && pnpm build` in terminal to install dependencies.
- `Load unpacked plugin` in Logseq Desktop client.

### License

MIT
