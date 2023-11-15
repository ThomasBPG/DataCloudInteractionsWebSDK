import { LightningElement } from 'lwc';

export default class BoligBeregner extends LightningElement {

    boligensPris = "";
    egenUdbetaling = "";

    handleBoligensPrisChange(event)
    {
      this.boligensPris = event.target.value;
    }

    handleEgenUdbetalingChange(event)
    {
      this.egenUdbetaling = event.target.value;
    }

    handleClick(event) {
        console.log("## Button 'Beregn' clicked; now submitting to Data Cloud");

        var anonymousId = SalesforceInteractions.getAnonymousId();
        console.log("AnonymousId: " + anonymousId);

        SalesforceInteractions.setLoggingLevel(5);

        SalesforceInteractions.sendEvent({
            interaction: {
              name: 'Boliglaansberegner',
              eventType: 'Boliglaansberegner',
              anonymousId: anonymousId,
              boligensPris: this.boligensPris,
              egenUdbetaling: this.egenUdbetaling
            }
          }).then(() => { console.log("Event emitted to Data Cloud"); });

    }

}