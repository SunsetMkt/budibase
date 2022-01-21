export const buildAuthEndpoints = API => ({
  /**
   * Performs a log in request.
   */
  logIn: async ({ email, password }) => {
    if (!email) {
      return API.error("Please enter your email")
    }
    if (!password) {
      return API.error("Please enter your password")
    }
    return await API.post({
      url: "/api/global/auth",
      body: {
        username: email,
        password,
      },
    })
  },

  /**
   * Logs the user out and invalidates their session.
   */
  logOut: async () => {
    return await API.post({
      url: "/api/global/auth/logout",
    })
  },

  /**
   * Fetches the currently logged in user object
   */
  fetchSelf: async () => {
    return await API.get({
      url: "/api/self",
    })
  },

  /**
   * Creates a user for an app.
   * @param user the user to create
   */
  createAppUser: async user => {
    return await API.post({
      url: "/api/users/metadata",
      body: user,
    })
  },

  /**
   * Updates the current user metadata.
   * @param metadata the metadata to save
   */
  updateOwnMetadata: async metadata => {
    return await API.post({
      url: "/api/users/metadata/self",
      body: metadata,
    })
  },

  /**
   * Creates an admin user.
   * @param adminUser the admin user to create
   */
  createAdminUser: async adminUser => {
    return await API.post({
      url: "/api/global/users/init",
      body: adminUser,
    })
  },

  /**
   * Saves a global config.
   * @param config the config to save
   */
  saveConfig: async config => {
    return await API.post({
      url: "/api/global/configs",
      body: config,
    })
  },

  /**
   * Gets a global config of a certain type.
   * @param type the type to fetch
   */
  getConfig: async type => {
    return await API.get({
      url: `/api/global/configs/${type}`,
    })
  },

  /**
   * Gets the OIDC config for a certain tenant.
   * @param tenantId the tenant ID to get the config for
   */
  getOIDCConfig: async tenantId => {
    return await API.get({
      url: `/api/global/configs/public/oidc?tenantId=${tenantId}`,
    })
  },

  /**
   * Gets the checklist for a specific tenant.
   * @param tenantId the tenant ID to get the checklist for
   */
  getChecklist: async tenantId => {
    return await API.get({
      url: `/api/global/configs/checklist?tenantId=${tenantId}`,
    })
  },

  /**
   * TODO: find out what this is
   */
  checkImportComplete: async () => {
    return await API.get({
      url: "/api/cloud/import/complete",
    })
  },

  /**
   * Gets the current environment details.
   */
  getEnvironment: async () => {
    return await API.get({
      url: "/api/system/environment",
    })
  },

  /**
   * Updates the company logo for the environment.
   * @param data the logo form data
   */
  uploadLogo: async data => {
    return await API.post({
      url: "/api/global/configs/upload/settings/logoUrl",
      body: data,
      json: false,
    })
  },

  /**
   * Uploads a logo for an OIDC provider.
   * @param name the name of the OIDC provider
   * @param data the logo form data to upload
   */
  uploadOIDCLogo: async ({ name, data }) => {
    return await API.post({
      url: `/api/global/configs/upload/logos_oidc/${name}`,
      body: data,
      json: false,
    })
  },

  /**
   * Gets the list of OIDC logos.
   */
  getOIDCLogos: async () => {
    return await API.get({
      url: "/api/global/configs/logos_oidc",
    })
  },
})
