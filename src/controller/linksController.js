const axios=require('axios');
const Users=require('../model/users');
const Links = require("../model/Links");
const Clicks = require('../model/Clicks');
const { getDeviceInfo } = require('../util/linksUtility');

const linksController = {
  create: async (request, response) => {
    const { campaign_title, original_url, category } = request.body;
    try {
      const user=await Users.findById({_id:request.user.id});
      if(user.credits<1){
        return response.status(400).json({
          code:'INSUFFICIENT_FUNDS',
          message:'Insufficient Credits'
        });
      }
      
      const link = new Links({
        campaignTitle: campaign_title,
        originalUrl: original_url,
        category:category,
        user: request.user.role==='admin'?request.user.id:request.user.adminId
      });

      await link.save();

      user.credits-=1;
      await user.save();
      return response.status(201).json({
        data: { id: link._id },
        message: "Link Created",
      });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: "Internal server error" });
    }
  },

  getAll: async (request, response) => {
    try {
      const userId=request.user.role==='admin'?request.user.id:request.user.adminId;
      const links = await Links.find({ user: userId }).sort({ createdAt: -1 });
      return response.status(200).json({ data: links });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: "Internal server error" });
    }
  },

  getById: async (request, response) => {
    try {
      const linkId = request.params.id;
      if (!linkId) return response.status(400).json({ error: "Link ID is required" });

      const link = await Links.findById(linkId);
      if (!link) return response.status(404).json({ error: "Link not found" });
      const userId=request.user.role==='admin'?request.user.id:request.user.adminId;

      if (link.user.toString() !== userId) {
        return response.status(403).json({ error: "Unauthorized access" });
      }

      return response.status(200).json({ data: link });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: "Internal server error" });
    }
  },

  update: async (request, response) => {
    try {
      const linkId = request.params.id;
      if (!linkId) return response.status(400).json({ error: "Link ID is required" });

      let link = await Links.findById(linkId);
      if (!link) return response.status(404).json({ error: "Link not found" });

      const userId=request.user.role==='admin'?request.user.id:request.user.adminId;

      if (link.user.toString() !==userId) {
        return response.status(403).json({ error: "Unauthorized access" });
      }

      const { campaign_title, original_url, category } = request.body;

      link = await Links.findByIdAndUpdate(
        linkId,
        {
          campaignTitle: campaign_title,
          originalUrl: original_url,
          category,
        },
        { new: true }
      );

      return response.status(200).json({ data: link });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: "Internal server error" });
    }
  },

  delete: async (request, response) => {
    try {
      const linkId = request.params.id;
      if (!linkId) return response.status(400).json({ error: "Link ID is required" });

      const link = await Links.findById(linkId);
      if (!link) return response.status(404).json({ error: "Link not found" });

      const userId=request.user.role==='admin'?request.user.id:request.user.adminId;

      if (link.user.toString() !== userId) {
        return response.status(403).json({ error: "Unauthorized access" });
      }

      await link.deleteOne();
      return response.status(200).json({ message: "Link deleted" });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: "Internal server error" });
    }
  },

  redirect: async (request, response) => {
    try {
      const linkId = request.params.id;
      if (!linkId) return response.status(400).json({ error: "Link ID is required" });

      const link = await Links.findById(linkId);
      if (!link) return response.status(404).json({ error: "Link not found" });

      const isDevelopement=process.env.NODE_ENV==='development';
      const ipAddress=isDevelopement?'8.8.8.8' // google ip address
      :request.headers['x-forwarded-for']?.split(',')[0] || request.socket.remoteAddress;

      const geoResponse=await axios.get(`http://ip-api.com/json/${ipAddress}`);
     
      if (geoResponse.data.status !== 'success') {
      console.log("Geo API Error:", geoResponse.data);
    }
     const {city,country,region,lat,lon,isp}=geoResponse.data;

      const userAgent=request.headers['user-agent'] || 'Unknown';
      const {deviceType,browser}=getDeviceInfo(userAgent);
      const referrer=request.get('Referrer')|| null;

      await Clicks.create({
        linkId:link._id,
        ip:ipAddress,
        city:city,
        country:country,
        region:region,
        latitude:lat,
        longitude:lon,
        isp:isp,
        referrer:referrer,
        userAgent:userAgent,
        deviceType:deviceType,
        browser:browser,
        clickedAt:new Date()
      });

      
      

      link.clickCount += 1;
      await link.save();

      return  response.status(200).json({ url: link.originalUrl, clickCount: link.clickCount });

    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: "Internal server error" });
    }
  },

  analytics:async(request,response)=>{
    try{
      const {linkId,from,to}=request.query;
      const link=await Links.findById(linkId);
      if(!link){
        return response.status(404).json({
          error:'Link not found'
        });
      }

      const userId=request.user.role==='admin'?
      request.user.id :   request.user.adminId;
      if(!link.user || link.user.toString()!==userId){
        return response.status(403).json({error:'Unauthorized Access'});
      }

      const query={linkId};

      if(from && to){
        query.clickedAt={$gte: new Date(from), $lte:new Date(to)};
      }

      const data=await Clicks.find(query).sort({clickedAt:-1});
      response.json(data);

    }
    catch(error){
      console.log(error);
      response.status(500).json({
        message:'Internal Server Error'
      });
    }
  },
};

module.exports = linksController;
