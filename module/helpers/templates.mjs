/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/torchship/templates/actor/parts/actor-features.html",
    "systems/torchship/templates/actor/parts/actor-items.html",
    "systems/torchship/templates/actor/parts/actor-spells.html",
    "systems/torchship/templates/actor/parts/actor-effects.html",
    "systems/torchship/templates/actor/parts/actor-certs.html",
    "systems/torchship/templates/actor/parts/actor-patches.html",
    "systems/torchship/templates/actor/parts/actor-traits.html",
    "systems/torchship/templates/actor/parts/actor-impulses.html"

  ]);
};
