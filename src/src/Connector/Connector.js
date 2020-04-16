/**
 * Generic Metadata Set Object - Represents a single set of metadata that is linked to a connection to actually filter and query metadata
Metadata Set Object needs to expose methods for answering these questions:
What fields can I filter on? What are the filter options? What logic needs to be applied to the filter components (eg selecting one filter option may modify options available in another filter field)? Etc. Minimum functionality to support in Round 1 of the Metadata Browser is the same as the non-generic filter functionality available now in MSP.
How do I retrieve the full details of a resource?
How do I request a search and apply filters that returns a list of objects? How do I “page” between search results? How do I filter the search results further?
How do I auto-complete full text searches (if supported)?
How do I export a single resource? Which types of resources can be exported? Which export formats are available for a given resource?
How do I export a set of resources? Which types of resources may be exported as part of a set? Which export formats are available?
What’s the structure of metadata for each resource type in the metadata set?

 *
 * Build Generic Connector module, which contains a base Connector object
 * (that other connectors can extend) and MSP and OCL Connector objects to
 * handle authentication and querying of external APIs (#685)
 */

//.. Implementation questions: 
//... Should this be a class? Should we do a new class for MSP and OCL connector?
export class Connector {

    constructor(metadataSet) {
        this.metadataSet = metadataSet;
    }


    /* template for this function is loadIndicatorData which does additional things to the data
   that we should consider before implementing novel data / ui processing */
    getJSONDataFromAPI = async () => {
        try {
            console.log("Fetching from " + this.url);
            const response = await fetch(this.url);

            if (!response.ok) {
                console.log(response);
                throw new Error(
                    `Error when fetching data: ${response.status} ${response.statusText}`
                );
            }
            const jsonData = await response.json();
            if (!jsonData.length || jsonData.length === 0) {
                console.log("jsonData is empty");
                //setIndGroupLoading(false);
                throw new Error(
                    `Warning data is empty from source `
                );
            }
            this.jsonData = jsonData;
            return jsonData;

        } catch (e) {
            console.log("error:" + e.message);
            //setError(e.message);
        }
    }
}

export class PepfarIndicatorConnector extends Connector {
    constructor(metadataSet) {
        super(metadataSet);
        this.url = metadataSet.url + "/concepts/?verbose=true&limit=0&conceptClass=\"Reference+Indicator\"";
    }
}

export class PepfarElementConnector extends Connector {
    constructor(metadataSet) {
        super(metadataSet);
        this.url = metadataSet.url + "concepts/?verbose=true&conceptClass=\"Data+Element\"&limit=10&page=1";
    }
}


export async function queryMetadataSet(metadataSet) {
    console.log(metadataSet);
    let requestParams = {
        url: metadataSet.url
    }
    // let response = await runQuery(requestParams);
    const url = getQueryUrlForMetadataSet(metadataSet)
    const jsonData = await getJSONDataFromAPI(url);
    console.log(jsonData);
}

/* Url is whatever is specified in domainConfig and whatever we append here... 
But if this is just something static why not just specify it in domain config? */
function getQueryUrlForMetadataSet(metadataSet) {
    let url = metadataSet.url;
    switch (metadataSet.id) {
        case 'reference-indicators':
            return url + "/concepts/?verbose=true&limit=0&conceptClass=\"Reference+Indicator\"";
        case 'data-elements':
            return url + "concepts/?verbose=true&conceptClass=\"Data+Element\"&limit=10&page=1";
    }
}

/* template for this function is loadIndicatorData which does additional things to the data
   that we should consider before implementing novel data / ui processing */
const getJSONDataFromAPI = async (url) => {
    try {
        console.log("Fetching from " + url);
        const response = await fetch(url);

        if (!response.ok) {
            console.log(response);
            throw new Error(
                `Error when fetching data: ${response.status} ${response.statusText}`
            );
        }
        const jsonData = await response.json();
        if (!jsonData.length || jsonData.length === 0) {
            console.log("jsonData is empty");
            //setIndGroupLoading(false);
            throw new Error(
                `Warning data is empty from source `
            );
        }
        return jsonData;

    } catch (e) {
        console.log("error:" + e.message);
        //setError(e.message);
    }
}

const runQuery = async (params) => {
    console.log("running query");
    const { url, headers, contentType } = params;

    try {
        let response = await fetch(url, {
            contentType: contentType ? contentType : "application/json",
            headers: headers ? headers : null,
        })

        if (!response.ok) {
            throw new Error(response)
        }

        let responseJson = await response.json()

        return responseJson
    }

    catch (err) {
        console.log("We had an error", err)
    }
}

async function runMerQuery(api) {

    // Environment variable with default applied, which should come from 
    const OCL_DOMAIN = (window.OCL_DOMAIN) || 'staging.openconceptlab.org';
    const domain = OCL_DOMAIN

    // Custom attributes - Get these from the domain config
    const org = "PEPFAR-Test7";

    // Based on current user session, likely with defaults (which could be hardcoded or from the domain config)
    const rowsPerPage = 25;
    const page = 0;

    // Get this from the filter panel/search box
    const indicatorQuery = "";
    const version = "";

    let queryDataElementsAllPeriodsMER = 'https://api.' + domain + '/orgs/' + org + '/sources/MER' + version + '/concepts/?verbose=true&conceptClass="Data+Element"&limit=' + rowsPerPage + '&page=' + (page + 1) + indicatorQuery;
    let response = await fetch(queryDataElementsAllPeriodsMER);

    console.log(response)
}

const loadIndicatorData = async (queryIndicators) => {
    /*
    const domain = 'staging.openconceptlab.org';
    const org = "PEPFAR-Test7";
    const source = "";
    console.log(queryIndicators);
    var queryIndicators = "https://api." + domain + "/orgs/" + org + "/sources/MER" + source + "/concepts/?verbose=true&limit=0&conceptClass=\"Reference+Indicator\"";
    */
    console.log("loadIndicatorData - queryIndicators : " + queryIndicators);
    //setIndGroupLoading(true);
    try {
        const response = await fetch(queryIndicators);
        if (!response.ok) {
            console.log(response);
            throw new Error(
                `Error when retrieve indicators ${response.status} ${response.statusText}`
            );
        }
        const jsonData = await response.json();
        if (!jsonData.length || jsonData.length === 0) {
            console.log("jsonData is empty");
            //setIndGroupLoading(false);
            throw new Error(
                `Warning indicators data is emtpy from OCL `
            );
        }

        console.log("indicators: " + jsonData.length);
        console.log(jsonData);
        /*var d = createIndicatorListForUI(jsonData);
        var sortedData = sortJSON(d, 'name', 'asc');
        setIndicatorsListForUI (sortedData);
        setFilteredIndicatorsListForUI(sortedData);
       
        var indGroupTemp = getIndicatorGroup(d);        
        setIndicatorGroups(indGroupTemp);        
        setIndGroupLoading(false);*/
    } catch (e) {
        console.log("error:" + e.message);
        //setError(e.message);
    }
}

async function runQuery2(api) {
    let response = await fetch(queryDataElementsAllPeriodsMER);
    const OCL_DOMAIN = (window.OCL_DOMAIN) || 'staging.openconceptlab.org';
    const domain = OCL_DOMAIN
    const org = "PEPFAR-Test7";
    const rowsPerPage = 25;
    const page = 0;
    const indicatorQuery = "";
    const version = "";

    let queryDataElementsAllPeriodsMER = 'https://api.' + domain + '/orgs/' + org + '/sources/MER' + version + '/concepts/?verbose=true&conceptClass="Data+Element"&limit=' + rowsPerPage + '&page=' + (page + 1) + indicatorQuery;

    let params = {

    }
    console.log(response)
}