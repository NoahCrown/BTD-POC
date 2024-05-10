# Signal creation examples

N.B. Sample signals listed on this page use Extensible Data Notation (EDN) as a format this is to simplify them and provide full semantics e.g. sets as distinct from vectors or other collection types. The API will in fact by default return JSON.

## About

In order to create [signals](https://github.com/information-sharing-networks/signals) within the ISN a participant may use their participant site and its API.
Signals are created using an Indieweb 'event' post type by calling the ISN site 'micropub' endpoint, internally this creates a 'signal' compliant with the information-sharing-network signals spec.

## Sample signals
The BTD 1 domain is pre-notifications and compliance.
At the time of writing signal examples below are compatible with 0.8.0+ of the ISN reference implementation.

### Creating an original simple BTD 1 relevant signal

ISN participants create [spec compliant signals](https://github.com/information-sharing-networks/signals) by using their Participant Site API.

Within the context of BTD 1 if the information is available to participants for a given goods movement it is possible to specify an ETA for arrival at destination port, this is useful information for the Port Health Authority team. An ETA can be specified using the 'start' field and can be included in the summary field as additional human readable information.

The simplest possible BTD 1 relevant signal (using the x-www-form-urlencoded content type) would look something like the below (N.B. swap out cnCode, unitId and other fields for relevant values etc):

```bash
curl -i -X POST -H "Authorization: Bearer YOUR-TOKEN" -d h=event -d "name=brazil nuts" -d start="2024-03-25T15:00:00.00Z" -d "summary=moving to PortA with ETA 2024-03-25T15:00:00.00Z" -d category=pre-notification -d category=isn@btd-1.info-sharing.network -d "description=cnCode=cnNuts^countryOfOrigin=GB^mode=RORO" https://your-site.my-example.xyz/micropub
```

It is also possible to create a signal by passing JSON to the micropub endpoint:

```bash
curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR-TOKEN" -d '{"h": "event", "name": "brazil nuts", "start": "2024-03-25T15:00:00.00Z", "summary": "moving to PortA with ETA 2024-03-25T15:00:00.00Z", "category": ["pre-notification", "isn@btd-1.info-sharing.network"], "description": "cnCode=cnNuts^countryOfOrigin=GB^mode=RORO"}' https://your-site.my-example.xyz/micropub
```

A more complex payload can be passed in when using JSON by adding a 'payload' field:

```bash
curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR-TOKEN" -d '{"h": "event", "name": "chicken and beef", "start": "2024-03-25T15:00:00.00Z", "summary": "moving to PortA with ETA 2024-03-25T15:00:00.00Z", "category": ["pre-notification", "isn@btd-1.info-sharing.network"], "payload": {"cnCodes": ["cnchicken123", "cnbeef123"], "commodityDescription": "Chicken 40%, beef 60%", "countryOfOrigin": "GB", "chedNumbers": ["CN010203"], "unitIdentification": {"ContainerNumber": "containerNo123"}, "mode": "RORO", "exporterEORI": "eori-exp-01", "importerEORI": "eori-imp-01"}}' https://your-site.my-example.xyz/micropub
```

> [!NOTE]
>A successful signal will generate a response with a 201 status code.

> [!WARNING]
>When creating a signal and problems occur a number of errors will be displayed in the response to assit the user in identifying the cause of the issue:

- Error code 400 - indicates the user has not complied with the specification required to make a signal and may need to amend the request.

- Error code 401 - the user's access token is invalid. You can get the valid access token from the 'Account' tab in you ISN participant site. The valid token should replace the words YOUR-TOKEN in the "Authorization: Bearer YOUR-TOKEN" in the request.


As an illustration the signal created might look something like:

```clojure
{
  :provider "organisation-a.my-example.xyz"
  :start "2024-04-01T15:00:00.00Z" ; Indicates an ETA
  :end "2024-04-20T18:00:00Z"
  :published "2024-01-08T12:51:51.379072Z"
  :signalId "704e851a-9ab4-40d6-b995-765f64104072"
  :correlationId "734713bc04-valid-uuid-here-xxxx"
  :category #{"pre-notification" "isn@btd-1.info-sharing.network"}
  :object "Chicken plus Beef shipment"
  :predicate "arriving at Port A with ETA 2024-04-01T15:00:00.00Z"
  :payload {
    :cnCodes #{"cnchicken01" "cnbeef02"} ; e.g. minimally resolved cncodes will be four characters/digits long (may be longer or more resolved)
    :countryOfOrigin "GB"
    :commodityDescription "Chicken 40%, beef 60%"
    :chedNumber "CN010203" ; e.g. either a CHED-D or a CHED-P number
    ; N.B. unitIdentification is not exhaustive
    :unitIdentification {:containerNumber "containerNo123" :trailerRegistrationNumber "trailerRegNo123"}
    :mode "RORO"
    :exporterEORI "EORI-exp-01"
    :importerEORI "EORI-imp-01"
  }
}
```

### Creating a workflow with multiple signals on the same thread

#### Creating the original signal

It is possible to create a 'golden thread' of related signals. An original signal is created as below (N.B. swap out cnCode, unitId and other fields for relevant values etc):

```bash
curl -i -X POST -H "Authorization: Bearer YOUR-TOKEN" -d h=event -d "name=brazil nuts" -d "summary=moving to PortA" -d category=pre-notification -d category=isn@btd-1.info-sharing.network -d "description=cnCode=cnNuts^countryOfOrigin=GB^unitId=134149^unitType=container^mode=RORO" https://your-site.my-example.xyz/micropub
```

As an illustration the signal created might look something like the previous example response.

and in this case it has a correlation-id '734713bc04-valid-uuid-here-xxxx'.

#### Attaching a second signal to the original to share an opinion

A second participant can use the correlation-id from the original signal to attach an opinion to it in the form of a second signal:

```bash
curl -i -X POST -H "Authorization: Bearer YOUR-TOKEN" -d h=event -d "name=nuts and bolts" -d "summary=reclassified as nuts and bolts" -d category=pre-notification -d category=isn@btd-1.info-sharing.network -d "description=correlation-id=734713bc04-valid-uuid-here-xxxx^cnCode=cnNutsBolts^countryOfOrigin=GB^unitId=134149^unitType=container^mode=RORO" https://your-site.my-example.xyz/micropub
```
In the web dashboard this signal will be attached to the original in a list (it will be indented indicated there is a thread). When retrieving signals with the API they are grouped by correlation-id to preserve this relationship.
