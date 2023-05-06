/**
 * Copyright © 2022 Alexander Lais
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished
 * to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import '@logseq/libs'

/**
 * Set up plugin
 */
async function main() {

  // define CSS styles used
  logseq.provideStyle(`
    .dynamic-lookup {
       white-space: initial; 
       cursor: default;
       display: flex;
    }`)

  /** Renderer for the template `:lookup`
   * @param slot Slot defines the UI element where the contributed UI is placed
   * @param payload string[] defines 4 parameters in total:
   *           - `type`, must be ':lookup'
   *           - `target`, the name of a page on which to look up page properties
   *           - `propertyNames`, the names of the page properties, whose values to retrieve
   *           - (`template`), optional template used to format the value.
   *             The literal property values prefixed with `$` are replaced by the respective property value.
   *             As fallback, `$value` is replaced with the value of the first property.
   *
   * No UI element is inserted / returned, when `property` is not defined on `page`,
   * or `page` does not even exist.
   */
  logseq.App.onMacroRendererSlotted(({slot, payload}) => {
    // console.debug(`rendering slot ${slot} with payload:`, payload)
    const [type, target, propertyNameList, formatTemplate, fallbackTemplate] = payload.arguments
    if (!type || type != ':lookup') {
      return
    }

    // split properties by ":", remove any empty entries.
    const propertyNames = propertyNameList.split(":").map((prop) => prop.trim()).filter(prop => prop !== "")

    if (propertyNames.length == 0) {
      return
    }

    const legacyPropertyName = 'value'

    let format = `<span class="dynamic-lookup">$${propertyNames.join(", $")}</span>`
    if (payload.arguments.length > 3) {
      format = formatTemplate
      console.trace("setting template to: ", format)
    }

    const query = `[
      :find ?prop
      :where 
      [?p :block/original-name ?on]
      [?p :block/properties ?prop]
      [(= ?on "${target}")]
    ]`

    console.debug(":query", query)

    logseq.DB.datascriptQuery(query).then(result => {
      const properties = result[0][0]

      // intersection of requested and available properties
      const foundProperties = Object.keys(properties).filter(value => propertyNames.includes(value))
      if (foundProperties.length == 0) {
        throw RangeError("no properties found, use fallback template")
      }

      // backward compatibility for placeholder $value, but avoid masking a property named 'value'.
      // @deprecated
      if (format.indexOf(`$${legacyPropertyName}`) > -1 && !(legacyPropertyName in properties)) {
        properties[legacyPropertyName] = properties[propertyNames[0]]
        foundProperties.push(legacyPropertyName)
        console.warn(`Deprecated: Setting legacy placeholder value for template: ${legacyPropertyName}=${properties[legacyPropertyName]}`)
      }

      // fill in the template with retrieved property values
      let template = format
      for (const propertyName of foundProperties) {
        let value = "";
        if (propertyName in properties) {
          value = properties[propertyName]
          if (propertyName === "tags" && formatTemplate === undefined) {
            const htmlTemplate = '<a data-ref="${pageName}" class="tag">#${pageName}</a>'
            const separatorSpanTemplate = '<span> </span>'
            if (Array.isArray(value)) {
              value = `<div>${value.map((tag) => {
                return htmlTemplate.replaceAll("${pageName}", tag)
              }).join(separatorSpanTemplate)}</div>`
            } else {
              value = htmlTemplate.replaceAll("${pageName}", value)
            }
          }
          template = template.replace(`$${propertyName}`, value)
        }
        console.info(propertyName, template)
      }

      logseq.provideUI({
        key: slot,
        slot,
        reset: true,
        template
      })
    }).catch(_ => {
      if (fallbackTemplate) {
        logseq.provideUI({
          key: slot,
          slot, reset: true,
          template: fallbackTemplate
        })
      }
    })
  })
}

// bootstrap the plugin
logseq.ready(main).catch(console.error)
