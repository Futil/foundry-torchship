import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class TorchshipActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["torchship", "sheet", "actor"],
      template: "systems/torchship/templates/actor/actor-sheet.html",
      width: 650,
      height: 800,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }]
    });
  }

  /** @override */
  get template() {
    return `systems/torchship/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // if(actorData.system.info.impulses == undefined){ //Create the impulse list if it doesn't exist.
    //   //Impulse Statuses
    //   //0 - Unselected
    //   //1 - Highlighted
    //   //2 - Crossed out
    //   actorData.system.info.impulses = {generous : {label : "Generous", status : "0", opposite : "Guarded"},
    //                               bold : {label : "Bold", status : "0", opposite : "Guarded"},
    //                               logical : {label : "Logical", status : "0", opposite : "Guarded"},
    //                               cynical : {label : "Cynical", status : "0", opposite : "Guarded"},
    //                               affectionate : {label : "Affectionate", status : "0", opposite : "Guarded"},
    //                               eager : {label : "Eager", status : "0", opposite : "Guarded"},
    //                               righteous : {label : "Righteous", status : "0", opposite : "Guarded"},
    //                               curious : {label : "Curious", status : "0", opposite : "Guarded"},
    //                               adventurous : {label : "Adventurous", status : "0", opposite : "Guarded"},
    //                               defiant : {label : "Defiant", status : "0", opposite : "Guarded"},
    //                               ambitious : {label : "Ambitious", status : "0", opposite : "Guarded"},
    //                               idealistic : {label : "Idealistic", status : "0", opposite : "Guarded"}}
    // }


    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    // for (let [k, v] of Object.entries(context.system.abilities)) {
    //   v.label = game.i18n.localize(CONFIG.BOILERPLATE.abilities[k]) ?? k;
    // }


    for (const property in context.system.info.impulses) {
      const impulse = context.system.info.impulses[property];

      let style = "";
      if(impulse.status == 1) style = "background-color: khaki;";
      if(impulse.status == 2) style = "background-color: darkred; color: white;";

      impulse.style = style;// = "<label for='system.info.impulses.{{key}}.value'" + style + "class='impulse-selector rollable flexlarge align-center', data-label='{{impulse.label}}' data-key='{{key}}'>{{impulse.label}}</label>"
    }

  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const certs = [];
    const patches = [];
    const traits = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'cert') {
        certs.push(i);
      }

      // Append to traits.
      else if (i.type === 'trait') {
        i.system.descHTML = TextEditor.enrichHTML(i.system.description, {secrets:true, entities:true, async: false});
        traits.push(i);
      }

      // Append to features.
      else if (i.type === 'patch') {
        patches.push(i);
      }
    }

    // Assign and return
    context.gear = gear;
    context.certs = certs;
    context.patches = patches;
    context.traits = traits;

  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.on('mousedown', '.division-selector', ev => { //Division Selector
      const data = super.getData();

      const div = $(ev.currentTarget);
      const targetName = div.data("key");
      const attribute = data.data.system.info.departments[targetName];


      attribute.value = !attribute.value;

      let color = "Grey";
      if(attribute.value) color = div.data("color");

      let updated = {
        style: "background-color:" + color + "; " + (attribute.value ? "opacity: 100%;" : "opacity: 50%;"),
        value: attribute.value
      }

      const updateString = "system.info.departments."+targetName;

      console.log(data.data.system.info.departments);
      this.actor.update({[updateString] : updated});
    });

    //Impulse Selector
      //Impulse Statuses
      //0 - Unselected
      //1 - Highlighted
      //2 - Crossed out
    html.on('mousedown', '.impulse-selector', ev => {
      const data = super.getData();

      const div = $(ev.currentTarget);
      const targetName = div.data("key");

      const attribute = data.data.system.info.impulses[targetName];

      if (ev.shiftKey) {
        attribute.status += 1;
        if(attribute.status > 2) attribute.status = 0;
      } else {

        if(ev.button == 0) attribute.points++;
        else if(attribute.points > 0) attribute.points--;
      
        if(attribute.status == 0){
          if(attribute.points = Math.min(attribute.points, 1));
        } else if(attribute.status == 2){
          attribute.points = 0;
        }
        
      }

      const updateString = "system.info.impulses."+targetName;
      this.actor.update({[updateString] : attribute});
    });


    // html.on('mouseover', '.impulse-selector', ev => {
    //   const data = super.getData();

    //   const div = $(ev.currentTarget);
    //   const targetName = div.data("key");
    //   console.log("gone over!");
    // }


    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      console.log(item);
      item.sheet.render(true);
    });

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.cert-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".cert");
      const item = this.actor.items.get(li.data("itemId"));
      console.log(item);
      item.sheet.render(true);
    });
    
    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.trait-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".trait");
      const item = this.actor.items.get(li.data("itemId"));
      console.log(item);
      item.sheet.render(true);
    });

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.trait-collapse').click(ev => {
      const li = ev.currentTarget.closest(".item");
      const item = duplicate(this.actor.getEmbeddedDocument("Item", li.dataset.itemId))
      item.system.collapsed = !item.system.collapsed;

      this.actor.updateEmbeddedDocuments('Item', [item]);

    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

}
