class Api::V1::RolesController < ApplicationController
  def index
    render json: Role.all
  end
end