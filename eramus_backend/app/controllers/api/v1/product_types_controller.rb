class Api::V1::ProductTypesController < ApplicationController
  def index
    render json: ProductType.all
  end
end