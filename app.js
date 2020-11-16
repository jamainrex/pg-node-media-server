const NodeMediaServer = require('node-media-server');
//Imports the Google Cloud client library
const { PubSub } = require('@google-cloud/pubsub');

const getStreamSlug = (streamPath) => {
  let parts = streamPath.split('/');
  return parts[parts.length - 1];
};

const NodePubSub = async (streamId, msg, streamPath, args) => {
  // [START pubsub_publish_custom_attributes]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  const projectId = 'portgrace-backend-277111';
  const topicName = 'projects/portgrace-backend-277111/topics/live-streaming';
  const data = JSON.stringify(msg);

  // Creates a client; cache this for further use
  const pubSubClient = new PubSub({ projectId });

  async function publishMessageWithCustomAttributes() {
    // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
    const dataBuffer = Buffer.from(data);

    // Add two custom attributes, origin and username, to the message
    const customAttributes = {
      streamId: streamId,
      args: JSON.stringify(args),
      streamPath: streamPath,
      slug: getStreamSlug(streamPath)
    };

    const messageId = await pubSubClient
      .topic(topicName)
      .publish(dataBuffer, customAttributes);
    console.log(`Message ${messageId} published.`);
  }

  publishMessageWithCustomAttributes().catch(console.error);
  // [END pubsub_publish_custom_attributes]
}

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
    ssl: {
      port: 443,
      key: './privatekey.pem',
      cert: './certificate.pem',
    }
  },
  http: {
    port: 8000,
    mediaroot: './media',
    webroot: './www',
    allow_origin: '*',
    api: true
  },
  https: {
    port: 8443,
    key: './privatekey.pem',
    cert: './certificate.pem',
  },
  auth: {
    api: true,
    api_user: 'admin',
    api_pass: 'admin',
    play: false,
    publish: false,
    secret: 'nodemedia2017privatekey'
  },
  trans: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        dash: true,
        dashFlags: '[f=dash:window_size=3:extra_window_size=5]'
      }
    ]
  }
  // relay: {
  //   ffmpeg: 'C:/ffmpeg/bin/ffmpeg.exe',
  //   tasks: [
  //     {
  //       app: 'live',
  //       mode: 'push',
  //       edge: 'rtmp://104.154.208.139',
  //     }
  //   ]
  // }
};

let nms = new NodeMediaServer(config)
nms.run();

nms.on('preConnect', (id, args) => {
  console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on('postConnect', (id, args) => {
  console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('doneConnect', (id, args) => {
  console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('prePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  // let session = nms.getSession(id);
  // session.reject();
  NodePubSub(id, 'prePublish', StreamPath, args);
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  NodePubSub(id, 'postPublish', StreamPath, args);
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  NodePubSub(id, 'donePublish', StreamPath, args);
});

nms.on('prePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on('postPlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});