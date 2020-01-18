const AWS = require('aws-sdk')
const fp = require('lodash/fp')
const { DRY_RUN } = process.env

const RUNNING = 'running'
const STOPPED = 'stopped'

const getParams = (instanceIds: string[]) => {
  const params:any = {
    InstanceIds: instanceIds
  }
  if (DRY_RUN && DRY_RUN.toLowerCase() in ['true', 'on', 'yes', 'y']) {
    params.DryRun = true
  }
  return params
}

const startInstances = (instanceIds: string[]) => {
  if (instanceIds && instanceIds.length > 0) {
    const ec2 = new AWS.EC2()
    return ec2.startInstances(getParams(instanceIds)).promise()
  } else {
    return Promise.resolve()
  }
}

const stopInstances = (instanceIds: string[]) => {
  if (instanceIds && instanceIds.length > 0) {
    const ec2 = new AWS.EC2()
    return ec2.stopInstances(getParams(instanceIds)).promise()
  } else {
    return Promise.resolve()
  }
}

const toggleInstances = (instances: any) => {
  const respHandler = (name:string, resp:any) => {console.log(name + " instances", JSON.stringify(resp, null, 2))}
  
  return stopInstances(instances[RUNNING])
  .then( (_stopResp:any) => {
    respHandler('stopped', _stopResp)
    return startInstances(instances[STOPPED])
    .then( (_startResp:any) => {respHandler('started', _startResp)}) 
  })
}

export const handler = async (event:any, context:any) => {

  console.log("event", JSON.stringify(event))
  const ec2 = new AWS.EC2()
  const params = { }

  // TODO: handle NextToken
  return ec2.describeInstances(params).promise()
  .then( (resp: any) => {
    let instances: any = {}
    instances[RUNNING] = [], 
    instances[STOPPED] = []

    fp.each((reservation:any) => {
      fp.each((instance:any) => {
        instances[instance.State.Name] = instances[instance.State.Name] ?? [] 
        instances[instance.State.Name].push(instance.InstanceId)
      })(reservation.Instances)
    })(resp.Reservations)
    console.log("toggling instance states", JSON.stringify(instances, null, 2))
    return toggleInstances(instances)
  })


  
}