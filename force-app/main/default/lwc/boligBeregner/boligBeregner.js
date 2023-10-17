import { LightningElement } from 'lwc';

export default class BoligBeregner extends LightningElement {

    handleClick(event) {
        console.log("## Clicked Beregn in LWC; now submitting to Data Cloud");

        var anonymousId = SalesforceInteractions.getAnonymousId();
        console.log("AnonymousId: " + anonymousId);

        SalesforceInteractions.setLoggingLevel(5);

        SalesforceInteractions.sendEvent({
            interaction: {
              name: 'BoligberegnerUsage',
              eventType: 'BoligberegnerUsage',
              anonymousId: anonymousId,
              husstandensIndkomst: 50000,
              egenOpsparingFormue: 2300000,
              gaeld: 560000
            }
          });

        console.log("Event emitted to Data Cloud");
    }

}