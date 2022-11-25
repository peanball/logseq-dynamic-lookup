# Dynamic Lookup Plugin

This plugin allows you to look up properties on a target page and place their values in your text.

Great for macros that automatically augment links to specific pages or tags.

## Usage

The plugin is used by adding a `{{renderer}}` macros with target `:lookup`:

```clojure
{{renderer :lookup, page, propertyNames, template, [fallbackTemplate]}}
```

- `page` is the name (`:block/original-name`, i.e. the name you see in the UI) of the page
- `propertyNames` is a list of property names, separated by `:`. Empty values will be ignored. You could write `:prop1:prop2` without negative effect.
- `template` is an optional formatter for the value. This can contain HTML to wrap the property value as needed. By default, the property value is added verbatim in a `<span>`.
- `fallbackTemplate` is an optional formatter for the value. This can contain test that is printed when the page or property value could not be found.

When the `page` could not be found, or the `page` does not have any of the properties defined via `propertyNames`, the renderer block uses the `fallbackTemplate`, if one is defined.  
If none is defined, the block is replaced with nothing. This makes it safe to use in macros, even if e.g. the target page does not exist (yet).

When only some properties requested in `propertyNames` are found on the target page, the ones not found are replaced with nothing (empty string). Any placeholders that is not listed in `propertyNames` will not be touched.

> ⚠️ **Deprecated:**
> 
> The placeholder `$value` is replaced by the first property in `propertyNames`.  
> This is for backward compatibility with uses of the plugin before 1.2.0.

## Use Cases and Examples

### Appending a single Property Value to a Tag

I've defined a macro `jira` in the custom.edn file that links to my notes to specific JIRA tickets where I use the issue ID as tag:

```clojure
:macros {
    "jira" "#$1 {{renderer :lookup, $1, summary, ($summary)}}"
}
```

The page `PROJ-123` has a property `summary:: This is a summary`.

The result looks something like this:

<span style="background: rgb(64,128,255); padding: 0.2em 0.4em; border-radius: 1em; color: white;">#PROJ-123</span> (This is a summary)

You could also use it to link to the actual issue. In a macro `$1`, `$2`, etc. can be used to define the template dynamically if needed.

### Linking to a custom URL defined in a Property

Another macro looks something like this:

```clojure
:macros {
    "supportcase" "[[$1]] {{renderer :lookup, $1, url:summary, / <a href='$url'>$summary</a>, <a href='https://support.example.com/search/$1'>🔍</a>}}"
}
```

This allows me to use:

```clojure
{{supportcase 1234}}
```

which shows as:

```
[[1234]] / Case Summary 
```

where `Case Summary` links to `:url` of the page `1234`.

And when there is no page `1234`, it adds a link to search for the term in the target system.

```
[[1234]] 🔍
```

## Building

> 🏷 Currently this only builds on Node <= 16.

- `pnpm install && pnpm build` in terminal to install dependencies.
- `Load unpacked plugin` in Logseq Desktop client.

### License

MIT
