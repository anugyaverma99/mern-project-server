const Links = require("../model/Links");

const linksController = {
  create: async (request, response) => {
    const { campaign_title, original_url, category } = request.body;
    try {
      const link = new Links({
        campaignTitle: campaign_title,
        originalUrl: original_url,
        category,
        user: request.user.id,
      });

      await link.save();
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
      const links = await Links.find({ user: request.user.id }).sort({ createdAt: -1 });
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

      if (link.user.toString() !== request.user.id) {
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

      if (link.user.toString() !== request.user.id) {
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

      if (link.user.toString() !== request.user.id) {
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

      link.clickCount += 1;
      await link.save();

      return  response.status(200).json({ url: link.originalUrl, clickCount: link.clickCount });

    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = linksController;
