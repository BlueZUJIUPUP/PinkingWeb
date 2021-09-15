<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="Title" style="width: 200px" class="filter-item" />
      <!-- <el-select v-model="listQuery.importance" placeholder="Imp" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item" />
      </el-select> -->
      <!-- <el-select v-model="listQuery.type" placeholder="Type" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'" :value="item.key" />
      </el-select> -->
      <el-select v-model="listQuery.sort" style="width: 10px margin-left: 10px;" class="filter-item">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button class="filter-item" style="margin-left: 10px;" icon="el-icon-search" round border>搜索</el-button>
      <div class="right-items" style="float: right;">
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" round dark @click="Addwin()">添加用例</el-button>
        <el-button :loading="downloadLoading" class="filter-item" type="success" icon="el-icon-download" round border>执行用例</el-button>
      </div>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="用例名称">
        <template slot-scope="scope">
          {{ scope.row.nodeID }}
        </template>
      </el-table-column>
      <el-table-column label="备注" width="200">
        <template slot-scope="scope">
          {{ scope.row.remark }}
        </template>
      </el-table-column>
      <el-table-column label="创建人" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column label="优先级" width="80px">
        12
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" round dark @click="Edit()">
            编辑
          </el-button>
          <el-button size="mini" type="danger" round da rk @click="Delete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- <pagination v-show="total>0" :total="0" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" /> -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用例名称" prop="title">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="timestamp">
          <el-date-picker v-model="temp.timestamp" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button round dark @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" round dark @click="dialogStatus==='Create'?Add():Edit()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      downloadLoading: false,
      dialogFormVisible: false,
      textMap: {
        Edit: 'Edit',
        Create: 'Create'
      },
      dialogStatus: 'Create',
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        name: '',
        type: '',
        status: '低'
      },
      statusOptions: ['高', '中', '低']
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = false
      this.$api.cases.getCaseList().then((res) => {
        this.list = res.data.msg.data
        this.listLoading = false
      })
    },
    Edit() {
      this.dialogFormVisible = true
      this.dialogStatus = 'Edit'
    },
    Delete(row) {
      const data = { 'id': row.id }
      this.$api.cases.deleteCase(data).then((res) => {
        this.fetchData()
      })
    },
    Addwin() {
      this.dialogFormVisible = true
      this.dialogStatus = 'Create'
    },
    Add() {
      this.dialogStatus = 'Create'
      const data = {
        'nodeID': this.temp.name,
        'remark': this.temp.remark
      }
      this.$api.cases.createCase(data).then((res) => {
        console.log(res)
      })
      this.dialogFormVisible = false
      this.fetchData()
    }
  }
}
</script>
