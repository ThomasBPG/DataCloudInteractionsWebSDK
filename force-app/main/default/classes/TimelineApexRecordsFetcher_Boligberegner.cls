public class TimelineApexRecordsFetcher_Boligberegner implements ITimelineApexRecordsFetcher {
    public List<ITimelineApexRecord> fetchRecords(String parentObject, String parentObjectId, Date rangeStart, Date rangeEnd) {
        // format range to strings
        final String rangeStartStr = this.toDateString(rangeStart);
        final String rangeEndStr = this.toDateString(rangeEnd);
         
        // get unified id
        Account a = [SELECT PersonContactId FROM Account WHERE Id =: parentObjectId LIMIT 1];
        ConnectApi.CdpQueryInput input = new ConnectApi.CdpQueryInput();
        input.sql = 'SELECT UnifiedRecordId__c FROM IndividualIdentityLink__dlm WHERE SourceRecordId__c=\'' + a.PersonContactId + '\'';
        ConnectApi.CdpQueryOutputV2 queryOutput = ConnectApi.CdPQuery.queryAnsiSqlV2(input);
        if (queryOutput.rowCount != 1) return null;
        String unifiedId = (String)queryOutput.data[0].rowData[0];
        
        // get engagement data
        input = new ConnectApi.CdpQueryInput();
        final String dateFilter = ' AND LastModifiedDate__c >= DATE(\'' + rangeStartStr + '\') AND LastModifiedDate__c < DATE(\'' + rangeEndStr + '\')';
        input.sql = 'SELECT Id__c, LastModifiedDate__c, egenUdbetaling__c, boligensPris__c from Boliglaanberegner__dlm where Individual__c IN (select SourceRecordId__c from IndividualIdentityLink__dlm where UnifiedRecordId__c=\'' + unifiedId + '\')';
        queryOutput = ConnectApi.CdPQuery.queryAnsiSqlV2(input);
        
        // loop
        final List<ITimelineApexRecord> result = new List<ITimelineApexRecord>();
        if (queryOutput.rowCount == 0) return result;
        for (ConnectApi.CdpQueryV2Row row : queryOutput.data) {
            result.add(new BoligberegnerTimelineApexRecord(row));
        }
        
        // return
        return result;
    }
    
    private String toDateString(Date d) {
        return d.year() + '-' + d.month() + '-' + d.day();
    }
    
    private class BoligberegnerTimelineApexRecord extends AbstractTimelineApexRecord {
        
        public BoligberegnerTimelineApexRecord(ConnectApi.CdpQueryV2Row row) {
            super('Last Modified', 'Egen udbetaling', 'Boligens pris');
            this.id = (String)row.rowData[0];
            
            String strdt = (String)row.rowData[1];
            Integer year = Integer.valueOf(strdt.substring(0,4));
            Integer month = Integer.valueOf(strdt.substring(5,7));
            Integer day = Integer.valueOf(strdt.substring(8,10));
            Integer hour = Integer.valueOf(strdt.substring(11,13));
            Integer minute = Integer.valueOf(strdt.substring(14,16));
            Integer second = Integer.valueOf(strdt.substring(17,19));
            this.dt = DateTime.newInstanceGmt(year, month, day, hour, minute, second);
            
            this.detailValue = (String)row.rowData[2];
            this.tooltipValue = (String)row.rowData[3];
        }
    }
}