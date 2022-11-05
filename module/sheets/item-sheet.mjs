/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class TorchshipItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["torchship", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/torchship/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.

    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    itemData.system.ranks = {untrained: "Untrained", familiar: "Familiar", skilled: "Skilled", expert: "Expert", master: "Master"};
    
    itemData.system.departments = {administration: {label : "Administration", color : "#fade25"},
                                  astrogation: {label : "Astrogation", color : "#333ea3"},
                                  engineering: {label : "Engineering", color : "#d17708"},
                                  medical: {label : "Medical", color : "#4ad4ad"},
                                  research: {label : "Research", color : "#79c0e0"},
                                  security: {label : "Security", color : "#a33333"},
                                  signals: {label : "Signals", color : "#ba60e0"},
                                  tactical: {label : "Tactical", color : "#71a847"},
                                  elective: {label : "Elective", color : "black"}};
    
    

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;



    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.
  }
}
